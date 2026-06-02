package services

import (
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"
	"shopping-list/products-search/models"
	"shopping-list/shared/contracts"
	sharedModels "shopping-list/shared/models"
	"sort"
	"strings"

	"shopping-list/products-search/internal/config"
	"shopping-list/products-search/utils"

	"github.com/bbalet/stopwords"
)

type ProductsSearchService struct{}

func NewProductsSearchService() *ProductsSearchService {
	return &ProductsSearchService{}
}

func getCategoryPriority(category string) int {
	if p, ok := categoryPriority[strings.ToLower(category)]; ok {
		return p
	}
	return 999
}

func (pss *ProductsSearchService) SearchProducts(
	query string,
	categories []string,
	page int,
	pageSize int,
) (*contracts.ProductsSearchResponse, error) {

	query = strings.ToLower(query)

	categorySet := make(map[string]struct{})
	for _, c := range categories {
		categorySet[strings.ToLower(c)] = struct{}{}
	}

	records, err := getRecords()
	if err != nil {
		return nil, err
	}

	var matches []sharedModels.Product

	for i, row := range records {
		if i == 0 || len(row) < 5 {
			continue
		}

		pid := row[0]
		name := row[1]
		brand := row[2]
		category := row[3]
		image := row[4]

		nameLower := strings.ToLower(name)
		brandLower := strings.ToLower(brand)
		categoryLower := strings.ToLower(category)

		if !strings.Contains(nameLower, query) &&
			!strings.Contains(brandLower, query) &&
			!strings.Contains(categoryLower, query) {
			continue
		}

		if len(categorySet) > 0 {
			if _, ok := categorySet[categoryLower]; !ok {
				continue
			}
		}

		matches = append(matches, sharedModels.Product{
			PID:      pid,
			Name:     name,
			Brand:    brand,
			Category: category,
			Image:    image,
		})
	}

	sort.Slice(matches, func(i, j int) bool {
		pi := getCategoryPriority(matches[i].Category)
		pj := getCategoryPriority(matches[j].Category)

		if pi == pj {
			return matches[i].Name < matches[j].Name
		}
		return pi < pj
	})

	paginated, totalPages := paginate(matches, page, pageSize)
	categoriesString := strings.Join(categories, ",")

	return &contracts.ProductsSearchResponse{
		Products:    paginated,
		DateUpdated: DateUpdated,
		Total:       len(matches),
		Page:        page,
		PageSize:    pageSize,
		TotalPages:  totalPages,
		Product:     query,
		Category:    categoriesString,
	}, nil
}

func (pss *ProductsSearchService) FuzzySearchProducts(
	query string,
	category string,
	page int,
	pageSize int,
) (*contracts.ProductsSearchResponse, error) {

	query = strings.ToLower(strings.TrimSpace(query))
	query = stopwords.CleanString(query, "nl", true)

	queryWords := strings.Fields(query)
	for i, w := range queryWords {
		queryWords[i] = utils.Singularize(w)
	}

	records, err := getRecords()
	if err != nil {
		return nil, err
	}

	categorySet := make(map[string]struct{})
	if category != "" {
		categorySet[strings.ToLower(category)] = struct{}{}
	}

	var results []models.ScoredProduct

	for i, row := range records {
		if i == 0 || len(row) < 5 {
			continue
		}

		item := strings.ToLower(row[1])
		brand := strings.ToLower(row[2])
		cat := strings.ToLower(row[3])

		if len(categorySet) > 0 {
			if _, ok := categorySet[cat]; !ok {
				continue
			}
		}

		score := 0

		itemWords := strings.Fields(item)
		brandWords := strings.Fields(brand)

		for i, w := range itemWords {
			itemWords[i] = utils.Singularize(w)
		}
		for i, w := range brandWords {
			brandWords[i] = utils.Singularize(w)
		}

		for _, qw := range queryWords {
			for _, iw := range itemWords {
				if qw == iw {
					score += 10
				} else if strings.Contains(iw, qw) {
					score += 1
				}
			}
			for _, bw := range brandWords {
				if qw == bw {
					score += 5
				} else if strings.Contains(bw, qw) {
					score += 1
				}
			}
			if qw == cat {
				score += 3
			}
		}

		if score > 0 {
			results = append(results, models.ScoredProduct{
				ProductObject: sharedModels.Product{
					PID:      row[0],
					Name:     row[1],
					Brand:    row[2],
					Category: row[3],
					Image:    row[4],
				},
				Score: score,
			})
		}
	}

	sort.Slice(results, func(i, j int) bool {
		if results[i].Score == results[j].Score {
			pi := getCategoryPriority(results[i].Category)
			pj := getCategoryPriority(results[j].Category)

			if pi == pj {
				return results[i].Product < results[j].Product
			}
			return pi < pj
		}
		return results[i].Score > results[j].Score
	})

	final := make([]sharedModels.Product, len(results))
	for i, r := range results {
		final[i] = r.ProductObject
	}

	paginated, totalPages := paginate(final, page, pageSize)

	return &contracts.ProductsSearchResponse{
		Products:    paginated,
		DateUpdated: DateUpdated,
		Total:       len(final),
		Page:        page,
		PageSize:    pageSize,
		TotalPages:  totalPages,
		Product:     query,
		Category:    category,
	}, nil
}

func getRecords() ([][]string, error) {
	productsPath := filepath.Join(config.Vars.DataDir, config.Vars.ProductsFile)
	file, err := os.Open(productsPath)
	if err != nil {
		return nil, err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Println("failed to close file:", err)
		}
	}(file)

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	return records, nil
}

func paginate[T any](items []T, page, pageSize int) ([]T, int) {
	if page < 1 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	totalItems := len(items)
	totalPages := (totalItems + pageSize - 1) / pageSize

	if page > totalPages {
		return []T{}, totalPages
	}

	start := (page - 1) * pageSize
	end := start + pageSize
	if end > totalItems {
		end = totalItems
	}

	return items[start:end], totalPages
}
