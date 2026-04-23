package tests

import (
	"shopping-list/shared/tests/db"
	"shopping-list/shared/tests/files"
	"shopping-list/shared/tests/http"
)

// HTTP package

var SetupEcho = http.SetupEcho
var SetupMultipartEcho = http.SetupMultipartEcho

type MultipartFile = http.MultipartFile

// DB package

var SetupDB = db.SetupDB
var Put = db.Put

// Files package

var SetupFile = files.SetupFile
var RemoveFile = files.RemoveFile
