#!/usr/bin/env groovy

import groovy.xml.MarkupBuilder

def basedir = "./"
def file = args[0]
def mode = args[1]

def ant = new AntBuilder();
ant.unzip(  src: basedir+file, dest:basedir+"tmp",  overwrite:"true")

// we read the core.xml file into dataMap (key:blockNr,value:array-of-cards)
def dataMap = [:]
def rootNode = new XmlParser().parse(new FileInputStream(basedir+"tmp/Core.xml"))
rootNode.cards[0].children().each { cardXmlElement ->
	def properties = [:]
	cardXmlElement.children().each {
		properties[it.@name] = it.@value
	}	
	if(mode == 'deck' || properties.Side == args[2]) {
		if(properties.Block == "") {
			properties.Block = "0";
		}
		properties.id=cardXmlElement.@id
		properties.name=cardXmlElement.@name
		def blockNr = properties.Block.toInteger();
		if(!dataMap.containsKey(blockNr)) {
			dataMap.put(blockNr, [])
		}
		dataMap.get(blockNr).add(properties)
	}
}

// this generates a HTML page
if(mode == 'gen') {

	// we need to add the image paths
	rootNode = new XmlParser().parse(new FileInputStream(basedir+"tmp/_rels/Core.xml.rels"))
	rootNode.children().each {
		dataMap.each() { blockNr, cardArray ->
			cardArray.each() { card ->
				if( 'C'+card.id.replace('-','') == it.@Id ) {
					card.fileName = it.@Target
				}
			}
		}	
	}

	new File(basedir+"out.html").withWriter { out ->
		out.println '<!DOCTYPE html>'
		out.println '<html><head><script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script></head><body>'
		out.println '<div id="out" style="border:5px solid black;margin-bottom:25px">&nbsp;</div>'
		out.println '<script type="text/javascript">'
		out.println 'function selectionChanged() {'
		out.println "var buff = 'swlcg-deckbuilder ${file} deck ', setCount = -1;"
		out.println '$("input[type=checkbox]").each(function() {if(this.checked) { setCount++; if(this.name.indexOf(" ") > -1) { buff += "\\"" } buff += this.name; if(this.name.indexOf(" ") > -1) { buff += "\\"" } buff += " " }});'
		out.println '$("#out").html(buff); document.title = "Set selected:"+setCount;'
		out.println '}'
		out.println '</script>'

		dataMap.sort( { k1, k2 -> k1 <=> k2 } as Comparator )*.key.each() { blockNr ->
			def cardArray = dataMap[blockNr]
			cardArray.sort { it["Block Number"] }
			out.println "<div style='border:5px solid black;margin-bottom:25px'>"
			out.println "<div style='font-size:20px'>BlockNr: ${blockNr} - ${cardArray[0].Affiliation}"
			if(blockNr != 0) {
				out.println "<input type='checkbox' name='${blockNr}' onchange='selectionChanged()'/><input type='checkbox' name='${blockNr}' onchange='selectionChanged()'/>"
			}
			out.println "</div>"
			cardArray.each() { item ->
				if(item.Type == "Objective") {
					out.println "<div><img style='width:425px;height:300px' src='${"tmp" + item.fileName}'/></div>"
				} else if(item.Type == "Affiliation") {
					out.println "<input type='checkbox' name='${item.name}' onchange='selectionChanged()'/><img style='width:300px;height:425px' src='${"tmp" + item.fileName}'/>"	
				} else {
					out.println "<img style='width:300px;height:425px' src='${"tmp" + item.fileName}'/>"	
				}
			}
			out.println "</div>"
		}
		out.println "</body></html>"
	}
}
else if(mode == 'deck') {
	// this generates a deck file for a given input from command line
	def paramAffiliation = args[2]
	def paramCardBlocks = args[3..args.size()-1]

	// since a block could be selected more than once, we need to build a map (blockNr->count)
	def blockNrMap = [:]
	paramCardBlocks.each() { blockNr ->
		def blockNrAsInt = blockNr.toInteger()
		if(!blockNrMap.containsKey(blockNrAsInt)) {
			blockNrMap.put(blockNrAsInt, 1);
		} else {
			blockNrMap.put(blockNrAsInt, blockNrMap[blockNrAsInt] + 1);
		}
	}

	def fileWriter = new FileWriter(basedir+"out.o8d")
	def xml = new MarkupBuilder(fileWriter)

	xml.deck(game:'d5cf89e5-1984-4873-8ae0-f06eea411bb3') {
		section(name:'Affiliation') {
			def cardArray = dataMap[0]
			cardArray.each() { item ->
				if(item.name == paramAffiliation) {
					card(qty:1, id:item.id, item.name)
				}
			}
		}
		section(name:'Command Deck') {
			blockNrMap.each() { blockNr, count ->
				def cardArray = dataMap[blockNr]
				cardArray.each() { item ->
					if(item.Type != "Objective") {
						card(qty:count, id:item.id, item.name)
					}
				}
			}
		}
		section(name:'Objective Deck') {
			blockNrMap.each() { blockNr, count ->
				def cardArray = dataMap[blockNr]
				cardArray.each() { item ->
					if(item.Type == "Objective") {
						card(qty:count, id:item.id, item.name)
					}
				}
			}
		}
	}
}

