package services

import (
	"fmt"
	"math"
	"net/http"
	"net/url"
	"shopping-list/shared/contracts"
	httphelper "shopping-list/shared/http"
	"shopping-list/shared/models"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type OnlineRecipeService struct {
	client  *httphelper.Client
	baseURL string
}

func NewOnlineRecipeService(client *httphelper.Client, baseURL string) *OnlineRecipeService {
	return &OnlineRecipeService{
		client:  client,
		baseURL: baseURL,
	}
}

func (s *OnlineRecipeService) GetRecipes(page int) (*contracts.GetOnlineRecipesResponse, error) {
	requestUrl := s.baseURL

	if page > 1 {
		requestUrl += "?page=" + strconv.Itoa(page)
	}

	return fetchRecipes(requestUrl, page)
}

func (s *OnlineRecipeService) GetRecipeDetails(url string) (*contracts.GetOnlineRecipeDetailsResponse, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	title := strings.Join(
		strings.Fields(
			doc.Find(`h1[itemprop="name"]`).First().Text(),
		),
		" ",
	)

	image, _ := doc.Find("img.recipe-image").Attr("src")

	var ingredients []string
	doc.Find(`li[itemprop="recipeIngredient"]`).Each(func(i int, s *goquery.Selection) {
		ingredient := strings.Join(strings.Fields(s.Text()), " ")
		if ingredient != "" {
			ingredients = append(ingredients, ingredient)
		}
	})

	var instructions []string
	doc.Find(`li[itemprop="recipeInstructions"]`).Each(func(i int, s *goquery.Selection) {
		text := strings.Join(strings.Fields(s.Text()), " ")
		if text != "" {
			instructions = append(instructions, text)
		}
	})

	nutrition := models.Nutrition{}

	nutrition.Calories = strings.TrimSpace(
		doc.Find(`[itemprop="calories"]`).First().Text(),
	)

	nutrition.Carbohydrates = strings.TrimSpace(
		doc.Find(`[itemprop="carbohydrateContent"]`).First().Text(),
	)

	nutrition.Sugars = strings.TrimSpace(
		doc.Find(`[itemprop="sugarContent"]`).First().Text(),
	)

	nutrition.Fat = strings.TrimSpace(
		doc.Find(`[itemprop="fatContent"]`).First().Text(),
	)

	nutrition.SaturatedFat = strings.TrimSpace(
		doc.Find(`[itemprop="saturatedFatContent"]`).First().Text(),
	)

	nutrition.Protein = strings.TrimSpace(
		doc.Find(`[itemprop="proteinContent"]`).First().Text(),
	)

	nutrition.Fiber = strings.TrimSpace(
		doc.Find(`[itemprop="fiberContent"]`).First().Text(),
	)

	timeText := doc.Find(".duration-container .duration").Text()
	timeText = strings.ToUpper(strings.TrimSpace(timeText))

	var recipeTime int
	if strings.Contains(timeText, "MIN") {
		timeText = strings.ReplaceAll(timeText, "MIN", "")
		timeText = strings.TrimSpace(timeText)

		parsed, err := strconv.Atoi(timeText)
		if err == nil {
			recipeTime = parsed
		}
	}

	yieldText := doc.Find(".yield-container .yield").Text()
	yieldText = strings.ToLower(strings.TrimSpace(yieldText))

	var persons int
	fields := strings.Fields(yieldText)
	if len(fields) > 0 {
		parsed, err := strconv.Atoi(fields[0])
		if err == nil {
			persons = parsed
		}
	}

	return &contracts.GetOnlineRecipeDetailsResponse{
		Title:        title,
		Image:        image,
		Ingredients:  ingredients,
		Instructions: instructions,
		Nutrition:    nutrition,
		Source:       url,
		Time:         recipeTime,
		Persons:      persons,
	}, nil
}

func (s *OnlineRecipeService) SearchRecipes(query string, page int) (*contracts.GetOnlineRecipesResponse, error) {
	requestUrl := fmt.Sprintf("%s/search?q=%s&page=%d", s.baseURL, urlQueryEscape(query), page)

	return fetchRecipes(requestUrl, page)
}

func fetchRecipes(url string, page int) (*contracts.GetOnlineRecipesResponse, error) {
	resp, err := http.Get(url)
	if err != nil {
		return &contracts.GetOnlineRecipesResponse{}, err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return &contracts.GetOnlineRecipesResponse{}, err
	}

	// no recipes found
	if doc.Find("div.noresult").Length() > 0 {
		return &contracts.GetOnlineRecipesResponse{
			Page:         page,
			MaxPages:     0,
			TotalRecipes: 0,
			Recipes:      []models.OnlineRecipe{},
		}, nil
	}

	var recipes []models.OnlineRecipe

	doc.Find("div.info.clearfix").Each(func(i int, s *goquery.Selection) {
		link := s.Find("h2 a")

		title := strings.Join(strings.Fields(link.Text()), " ")

		href, exists := link.Attr("href")
		if !exists {
			return
		}

		tile := s.Parent()
		image, _ := tile.Find("div.image img").Attr("src")

		recipes = append(recipes, models.OnlineRecipe{
			Title: title,
			URL:   href,
			Image: image,
		})
	})

	totalText := strings.TrimSpace(doc.Find("p.search-total").First().Text())
	totalText = strings.Fields(totalText)[0]

	total, err := strconv.Atoi(totalText)
	if err != nil {
		total = len(recipes)
	}

	maxPages := int(math.Ceil(float64(total) / 24.0))

	return &contracts.GetOnlineRecipesResponse{
		Page:         page,
		MaxPages:     maxPages,
		TotalRecipes: total,
		Recipes:      recipes,
	}, nil
}

func urlQueryEscape(q string) string {
	return url.QueryEscape(q)
}
