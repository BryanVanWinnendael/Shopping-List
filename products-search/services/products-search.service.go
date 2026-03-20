package services

import (
	"encoding/csv"
	"os"
	"sort"
	"strings"

	"shopping-list/products-search/models"
	"shopping-list/products-search/utils"

	"github.com/bbalet/stopwords"
)

type ProductsSearchService struct{}

func NewProductsSearchService() *ProductsSearchService {
	return &ProductsSearchService{}
}

func (pss *ProductsSearchService) SearchProducts(
	query string,
	categories []string,
) (models.ProductsSearchResult, error) {
	query = strings.ToLower(query)

	categorySet := make(map[string]struct{})
	for _, c := range categories {
		categorySet[strings.ToLower(c)] = struct{}{}
	}

	file, err := os.Open(ProductsCSV)
	if err != nil {
		return models.ProductsSearchResult{}, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return models.ProductsSearchResult{}, err
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

	return models.ProductsSearchResult{
		Products:    matches,
		DateUpdated: DateUpdated,
	}, nil
}

func (pss *ProductsSearchService) FuzzySearch(
	query string,
	category string,
) (models.ProductsSearchResult, error) {
	query = strings.ToLower(strings.TrimSpace(query))
	query = stopwords.CleanString(query, "nl", true)

	queryWords := strings.Fields(query)
	for i, w := range queryWords {
		queryWords[i] = utils.Singularize(w)
	}

	file, err := os.Open(ProductsCSV)
	if err != nil {
		return models.ProductsSearchResult{}, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return models.ProductsSearchResult{}, err
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
		return results[i].Score > results[j].Score
	})

	final := make([]models.Product, len(results))
	for i, r := range results {
		final[i] = r.Product
	}

	return models.ProductsSearchResult{
		Products:    final,
		DateUpdated: DateUpdated,
	}, nil
}
