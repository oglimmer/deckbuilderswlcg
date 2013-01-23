<%@ page pageEncoding="utf-8" contentType="text/html;charset=utf-8" session="false" %><!DOCTYPE html>
<html>
	<head>
		<title>Star Wars LCG Deck Builder</title>
		<meta charset="utf-8" />
		<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
		<script type="text/javascript" src="http://code.jquery.com/ui/1.10.0/jquery-ui.js"></script>
		<script type="text/javascript" src="core_data.js"></script>
		<script type="text/javascript" src="deckbuilder.js">></script>
		<link rel="stylesheet" type="text/css" href="deckbuilder.css" />
		<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css" />
	</head>
<body>
	<div id="infoBox">
		<a id="mainLinkLoad" style='display:none;' href="javascript:void(0)" onclick="user.showDeckList()">Load</a>
		<a id="mainLinkSave" style='display:none;' href="javascript:void(0)" onclick="user.saveDeck()">Save</a>
		<a id="mainLinkRegister" href="javascript:void(0)" onclick="user.register()">Register</a>
		<a id="mainLinkLogin" href="javascript:void(0)" onclick="user.login()">Login</a>
		<a id="mainLinkDark" href="javascript:void(0)" onclick="cards.createSide('Dark')">Go to Dark</a> 
		<a id="mainLinkLight" href="javascript:void(0)" onclick="cards.createSide('Light')">Go to Light</a>
		<a id="mainLinkReset" style='display:none;' href="javascript:void(0)" onclick="cards.createSide('reset')">Reset</a>
		<span id="out">Deck not ready</span>
		<div id="selected"></div>
	</div>
	<div id="main"></div>	
</body>
</html>






