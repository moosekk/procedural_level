build:
	tsc
	node_modules/.bin/babel -d tsc --presets babel-preset-es2015 --compact --minified --no-comments tsc
