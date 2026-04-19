package utils

import (
	"strings"

	"github.com/jinzhu/inflection"
)

var Irregulars = map[string]string{
	"eieren":  "ei",
	"tomaten": "tomaat",
	"kippen":  "kip",
	"vissen":  "vis",
	"broden":  "brood",
	"noten":   "noot",
	"sappen":  "sap",
	"bonen":   "boon",
}

func Singularize(word string) string {
	w := strings.ToLower(word)

	dutch := w

	if s, ok := Irregulars[w]; ok {
		dutch = s
	} else if before, ok0 := strings.CutSuffix(w, "iën"); ok0 {
		dutch = before + "ie"
	} else if before0, ok1 := strings.CutSuffix(w, "eren"); ok1 {
		dutch = before0
	} else if before1, ok2 := strings.CutSuffix(w, "en"); ok2 {
		stem := before1
		if len(stem) >= 2 {
			last := stem[len(stem)-1]
			prev := stem[len(stem)-2]
			if last == prev {
				stem = stem[:len(stem)-1]
			}
		}
		dutch = stem
	} else if before2, ok3 := strings.CutSuffix(w, "'s"); ok3 {
		dutch = before2
	} else if before3, ok4 := strings.CutSuffix(w, "s"); ok4 {
		dutch = before3
	}

	if dutch == w {
		return inflection.Singular(w)
	}

	return dutch
}
