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
		<link rel="stylesheet" type="text/css" href="css/ui-lightness/jquery-ui-1.10.0.custom.css" />
	</head>
<body>
	<div id="infoBox">
		<div id="tabs">
			<ul>
				<li><a href="#adminDiv"><span>Admin</span></a</li>
				<li><a href="#statisticsDiv"><span>Statistics</span></a</li>
				<li><a href="#selectedCardsDiv"><span>Card Blocks</span></a</li>
			</ul>
			<div id="adminDiv">
				<div id="mainLinkLogout" style='display:none;'>
					<a href="javascript:void(0)" onclick="user.logout()">Log out</a>
				</div>
				<div id="mainLinkLoad" style='display:none;'>
					<a href="javascript:void(0)" onclick="user.showDeckList()">Load deck</a>
				</div>
				<div id="mainLinkSave" style='display:none;'>
					<a href="javascript:void(0)" onclick="user.saveDeck()">Save deck</a>
				</div>
				<div id="mainLinkRegister">
					<a href="javascript:void(0)" onclick="user.register()">Register account</a>
				</div>
				<div id="mainLinkLogin">
					<a href="javascript:void(0)" onclick="user.login()">Login</a>
				</div>
				<div id="mainLinkDark">
					<a href="javascript:void(0)" onclick="cards.createSide('Dark')">Create new Dark side deck</a> 
				</div>
				<div id="mainLinkLight">
					<a href="javascript:void(0)" onclick="cards.createSide('Light')">Create new Light side deck</a>
				</div>
				<div id="mainLinkReset" style='display:none;'>
					<a href="javascript:void(0)" onclick="cards.askForReset()">Discard deck</a>
				</div>
				<div id="out">
					Deck not ready to download
				</div>
			</div>
			<div id="statisticsDiv"></div>
			<div id="selectedCardsDiv"></div>
		</div>
	</div>
	<div id="main"></div>	
</body>
</html>






