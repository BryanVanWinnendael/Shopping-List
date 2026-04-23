package services

import (
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"shopping-list/products-search/internal/config"
	"shopping-list/products-search/models"
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
) (models.ProductsSearchResult, error) {

	query = strings.ToLower(query)

	categorySet := make(map[string]struct{})
	for _, c := range categories {
		categorySet[strings.ToLower(c)] = struct{}{}
	}

	records, result, err2 := getRecords()
	if err2 != nil {
		return result, err2
	}

	var matches []models.Product

	for i, row := range records {
		if i == 0 || len(row) < 5 {
			continue
		}

		pid := row[0]
		item := row[1]
		brand := row[2]
		category := row[3]
		image := row[4]

		itemLower := strings.ToLower(item)
		brandLower := strings.ToLower(brand)
		categoryLower := strings.ToLower(category)

		if !strings.Contains(itemLower, query) &&
			!strings.Contains(brandLower, query) &&
			!strings.Contains(categoryLower, query) {
			continue
		}

		if len(categorySet) > 0 {
			if _, ok := categorySet[categoryLower]; !ok {
				continue
			}
		}

		matches = append(matches, models.Product{
			PID:      pid,
			Item:     item,
			Brand:    brand,
			Category: category,
			Image:    image,
		})
	}

	sort.Slice(matches, func(i, j int) bool {
		pi := getCategoryPriority(matches[i].Category)
		pj := getCategoryPriority(matches[j].Category)

		if pi == pj {
			return matches[i].Item < matches[j].Item
		}
		return pi < pj
	})

	paginated, totalPages := paginate(matches, page, pageSize)
	categoriesString := strings.Join(categories, ",")

	return models.ProductsSearchResult{
		Products:    paginated,
		DateUpdated: DateUpdated,
		Total:       len(matches),
		Page:        page,
		PageSize:    pageSize,
		TotalPages:  totalPages,
		Item:        query,
		Category:    categoriesString,
	}, nil
}

func (pss *ProductsSearchService) FuzzySearch(
	query string,
	category string,
	page int,
	pageSize int,
) (models.ProductsSearchResult, error) {

	query = strings.ToLower(strings.TrimSpace(query))
	query = stopwords.CleanString(query, "nl", true)

	queryWords := strings.Fields(query)
	for i, w := range queryWords {
		queryWords[i] = utils.Singularize(w)
	}

	records, result, err2 := getRecords()
	if err2 != nil {
		return result, err2
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
				Product: models.Product{
					PID:      row[0],
					Item:     row[1],
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
				return results[i].Item < results[j].Item
			}
			return pi < pj
		}
		return results[i].Score > results[j].Score
	})

	final := make([]models.Product, len(results))
	for i, r := range results {
		final[i] = r.Product
	}

	paginated, totalPages := paginate(final, page, pageSize)

	return models.ProductsSearchResult{
		Products:    paginated,
		DateUpdated: DateUpdated,
		Total:       len(final),
		Page:        page,
		PageSize:    pageSize,
		TotalPages:  totalPages,
		Item:        query,
		Category:    category,
	}, nil
}

func getRecords() ([][]string, models.ProductsSearchResult, error) {
	productsPath := filepath.Join(config.Vars.DataDir, config.Vars.ProductsFile)
	file, err := os.Open(productsPath)
	if err != nil {
		return nil, models.ProductsSearchResult{}, err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Println("Failed to close file:", err)
		}
	}(file)

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, models.ProductsSearchResult{}, err
	}
	return records, models.ProductsSearchResult{}, nil
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
