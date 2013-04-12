#!/usr/bin/env groovy

import java.lang.reflect.Array;

import groovy.xml.MarkupBuilder

def basedir = "./"

// convert list with maps to more complex data structure
def rootData = [
	Dark:[],
	Light:[]
];

args.each { file ->
		
//	mogrify -filter LanczosSharp -resize 85x85 -format jpg -quality 89 *.jpg //small
//	mogrify -filter LanczosSharp -resize 509x509 -format jpg -quality 89 *.jpg //large
//	mogrify -filter LanczosSharp -resize 423x423 -format jpg -quality 89 *.jpg //deckbuilder
	
	def colDef = ["Name","Set","ImageFile","Side","Category","Destiny","Rarity","Restrictions","Stats","Deploy","Forfeit","Icons","Text"]
	def defFile = new File(file)
	if(!defFile.exists() || !defFile.isFile() || !file.toString().endsWith(".txt")) {
		System.out.printf("%s is not a txt-file\r\n", file)
		return;
	}
	def baseDir = defFile.getParentFile()
	
	System.out.println("Processing "+defFile)
		
	defFile.splitEachLine("\t") {fields ->
		def properties = [:]
		fields.eachWithIndex { obj, index ->
			if(colDef[index]=='Category') {
				def subFields = obj.split(" -- ")
				properties[colDef[index]] = subFields[0]
				if(subFields.length>1) {
					properties["Subcategory"] = subFields[1]
				}
			} else if(colDef[index]=='ImageFile') {
				properties[colDef[index]] = obj.substring(obj.indexOf("-")+1)+".gif"
			} else {
				properties[colDef[index]] = obj
			}
		}
		//if(properties.Side == 'Light'||properties.Side == 'Dark') {
		if(properties.Set == 'Premiere') {
			properties.ImageFile = properties.Set.toLowerCase() +"-"+ properties.Side.toLowerCase() +"/"+ properties.ImageFile
			rootData[properties.Side].add(properties);
		}
	}	
	
}

// do some sorting
for(def side in rootData) {
	side.value.sort { it["Category"]+it["Subcategory"]+it["Set"] }
}

// let the JsonBuilder convert the groovy data strucutre into JSON
def builder = new groovy.json.JsonBuilder()
builder (
	rootData
)

new File(basedir+"core_data.js").withWriter { out ->
	out.println "var core_data = ${builder.toPrettyString()}"
}

