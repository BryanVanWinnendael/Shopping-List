package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
)

const (
	modelsDir     = "./shared/models"
	contractsDir  = "./shared/contracts"
	generatedDir  = "../app/types/generated"
	generatedText = "// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.\n\n"
)

type Model struct {
	Name       string
	Struct     *ast.StructType
	Alias      ast.Expr
	EnumValues []string
}

var models = map[string]Model{}

func main() {
	root, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	generatedDir := filepath.Join(
		root,
		generatedDir,
	)

	err = os.RemoveAll(generatedDir)
	if err != nil {
		panic(err)
	}

	modelOutput := filepath.Join(
		generatedDir,
		"models",
	)

	contractOutput := filepath.Join(
		generatedDir,
		"contracts",
	)

	err = os.MkdirAll(modelOutput, 0755)
	if err != nil {
		panic(err)
	}

	err = os.MkdirAll(contractOutput, 0755)
	if err != nil {
		panic(err)
	}

	loadModels(
		filepath.Join(root, modelsDir),
	)

	generateModels(modelOutput)

	generateContracts(
		filepath.Join(root, contractsDir),
		contractOutput,
	)
}

func loadModels(dir string) {
	files, err := filepath.Glob(
		filepath.Join(dir, "*.go"),
	)

	if err != nil {
		panic(err)
	}

	for _, file := range files {

		fset := token.NewFileSet()

		node, err := parser.ParseFile(
			fset,
			file,
			nil,
			parser.ParseComments,
		)

		if err != nil {
			panic(err)
		}

		aliases := map[string]bool{}

		for _, decl := range node.Decls {
			gen, ok := decl.(*ast.GenDecl)
			if !ok {
				continue
			}

			for _, spec := range gen.Specs {
				typeSpec, ok := spec.(*ast.TypeSpec)
				if !ok {
					continue
				}

				switch t := typeSpec.Type.(type) {

				case *ast.StructType:
					models[typeSpec.Name.Name] = Model{
						Name:   typeSpec.Name.Name,
						Struct: t,
					}

				default:
					models[typeSpec.Name.Name] = Model{
						Name:  typeSpec.Name.Name,
						Alias: t,
					}

					aliases[typeSpec.Name.Name] = true
				}
			}
		}

		for _, decl := range node.Decls {
			gen, ok := decl.(*ast.GenDecl)
			if !ok || gen.Tok.String() != "const" {
				continue
			}

			for _, spec := range gen.Specs {
				valueSpec, ok := spec.(*ast.ValueSpec)
				if !ok {
					continue
				}

				for i, name := range valueSpec.Names {

					if len(valueSpec.Values) <= i {
						continue
					}

					if !isStringType(valueSpec.Type) {
						continue
					}

					value, ok := stringLiteral(
						valueSpec.Values[i],
					)

					if !ok {
						continue
					}

					model, exists := models[valueSpec.Type.(*ast.Ident).Name]

					if exists {
						model.EnumValues = append(
							model.EnumValues,
							value,
						)

						models[valueSpec.Type.(*ast.Ident).Name] = model
					}

					_ = name
				}
			}
		}
	}
}

func generateModels(output string) {
	for _, model := range models {
		filename := snakeCase(model.Name) + ".ts"

		path := filepath.Join(
			output,
			filename,
		)

		var result strings.Builder

		result.WriteString(generatedText)

		if model.Struct == nil {
			if len(model.EnumValues) > 0 {
				result.WriteString(
					fmt.Sprintf(
						"export type %s =\n",
						model.Name,
					),
				)

				for _, value := range model.EnumValues {
					result.WriteString(
						fmt.Sprintf(
							"  | \"%s\"\n",
							value,
						),
					)
				}

				result.WriteString("\n")

			} else {
				result.WriteString(
					fmt.Sprintf(
						"export type %s = %s\n",
						model.Name,
						goTypeToTS(model.Alias),
					),
				)
			}

		} else {
			imports := map[string]bool{}

			var body strings.Builder

			body.WriteString(
				fmt.Sprintf(
					"export interface %s {\n",
					model.Name,
				),
			)

			for _, field := range model.Struct.Fields.List {
				if field.Tag == nil {
					continue
				}

				name, optional := jsonTag(
					field.Tag.Value,
				)

				if name == "" {
					continue
				}

				fieldType := modelTypeToTS(
					field.Type,
					model.Name,
					imports,
				)

				body.WriteString(
					fmt.Sprintf(
						"  %s%s: %s\n",
						name,
						optional,
						nullableType(fieldType, optional),
					),
				)
			}

			body.WriteString("}\n")

			for dependency := range imports {
				result.WriteString(
					fmt.Sprintf(
						"import { %s } from \"./%s\"\n",
						dependency,
						snakeCase(dependency),
					),
				)
			}

			if len(imports) > 0 {
				result.WriteString("\n")
			}

			result.WriteString(
				body.String(),
			)
		}

		os.WriteFile(
			path,
			[]byte(result.String()),
			0644,
		)
	}
}

func generateContracts(dir string, output string) {
	files, err := filepath.Glob(
		filepath.Join(dir, "*.go"),
	)

	if err != nil {
		panic(err)
	}

	for _, file := range files {
		fset := token.NewFileSet()

		node, err := parser.ParseFile(
			fset,
			file,
			nil,
			0,
		)

		if err != nil {
			panic(err)
		}

		imports := map[string]bool{}

		var body strings.Builder

		for _, decl := range node.Decls {
			gen, ok := decl.(*ast.GenDecl)
			if !ok {
				continue
			}

			for _, spec := range gen.Specs {
				typeSpec, ok := spec.(*ast.TypeSpec)
				if !ok {
					continue
				}

				body.WriteString(
					generateContractType(
						typeSpec,
						imports,
					),
				)
			}
		}

		var result strings.Builder

		result.WriteString(generatedText)

		for dependency := range imports {

			result.WriteString(
				fmt.Sprintf(
					"import { %s } from \"../models/%s\"\n",
					dependency,
					snakeCase(dependency),
				),
			)
		}

		if len(imports) > 0 {
			result.WriteString("\n")
		}

		result.WriteString(
			body.String(),
		)

		name := strings.TrimSuffix(
			filepath.Base(file),
			".go",
		)

		os.WriteFile(
			filepath.Join(
				output,
				name+".ts",
			),
			[]byte(result.String()),
			0644,
		)
	}
}

func generateContractType(
	typeSpec *ast.TypeSpec,
	imports map[string]bool,
) string {

	switch t := typeSpec.Type.(type) {

	case *ast.StructType:

		var out strings.Builder

		out.WriteString(
			fmt.Sprintf(
				"export interface %s {\n",
				typeSpec.Name.Name,
			),
		)

		for _, field := range t.Fields.List {

			if field.Tag == nil {
				continue
			}

			name, optional := jsonTag(field.Tag.Value)

			fieldType := contractTypeToTS(
				field.Type,
				imports,
			)

			out.WriteString(
				fmt.Sprintf(
					"  %s%s: %s\n",
					name,
					optional,
					nullableType(fieldType, optional),
				),
			)
		}

		out.WriteString("}\n\n")

		return out.String()

	default:

		return fmt.Sprintf(
			"export type %s = %s\n\n",
			typeSpec.Name.Name,
			nullableType(
				contractTypeToTS(
					t,
					imports,
				),
				"",
			),
		)
	}
}

func modelTypeToTS(expr ast.Expr, current string, imports map[string]bool) string {
	switch t := expr.(type) {
	case *ast.Ident:
		switch t.Name {
		case "string":
			return "string"
		case "bool":
			return "boolean"
		case "int", "int32", "int64", "float32", "float64":
			return "number"
		}

		if _, ok := models[t.Name]; ok {
			if t.Name != current {
				imports[t.Name] = true
			}
			return t.Name
		}

		return t.Name
	case *ast.ArrayType:
		return modelTypeToTS(t.Elt, current, imports) + "[]"
	case *ast.StarExpr:
		return modelTypeToTS(t.X, current, imports)
	}

	return "unknown"
}

func contractTypeToTS(expr ast.Expr, imports map[string]bool) string {
	switch t := expr.(type) {
	case *ast.SelectorExpr:
		imports[t.Sel.Name] = true
		return t.Sel.Name
	case *ast.ArrayType:
		return contractTypeToTS(t.Elt, imports) + "[]"
	case *ast.StarExpr:
		return contractTypeToTS(t.X, imports)
	}
	return goTypeToTS(expr)
}

func goTypeToTS(expr ast.Expr) string {
	switch t := expr.(type) {
	case *ast.Ident:
		switch t.Name {
		case "string":
			return "string"
		case "bool":
			return "boolean"
		case "int", "int32", "int64", "float32", "float64":
			return "number"
		default:
			return t.Name
		}
	}
	return "unknown"
}

func jsonTag(tag string) (string, string) {
	tag = strings.Trim(tag, "`")

	for _, part := range strings.Fields(tag) {
		if strings.HasPrefix(part, "json:") {
			value := strings.Trim(
				strings.TrimPrefix(part, "json:"),
				"\"",
			)

			parts := strings.Split(value, ",")

			if len(parts) > 1 && parts[1] == "omitempty" {
				return parts[0], "?"
			}

			return parts[0], ""
		}
	}

	return "", ""
}

func nullableType(fieldType string, optional string) string {
	if optional == "?" {
		return fieldType + " | null"
	}
	return fieldType
}

func isStringType(expr ast.Expr) bool {
	id, ok := expr.(*ast.Ident)
	return ok && id.Name != ""
}

func stringLiteral(expr ast.Expr) (string, bool) {
	lit, ok := expr.(*ast.BasicLit)
	if !ok {
		return "", false
	}
	return strings.Trim(lit.Value, "\""), true
}

func snakeCase(value string) string {
	var out []rune
	for i, r := range value {

		if i > 0 && r >= 'A' && r <= 'Z' {
			out = append(out, '_')
		}

		out = append(out, r)
	}
	return strings.ToLower(string(out))
}
