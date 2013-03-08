<%@ page pageEncoding="utf-8" contentType="text/html;charset=utf-8" session="false" %><!DOCTYPE html>
<html>
	<head>
		<title>Star Wars LCG Deck Builder</title>
		<meta charset="utf-8" />
		<script type="text/javascript" src="js/jquery-1.9.0.js"></script>
		<script type="text/javascript" src="js/jquery-ui-1.10.0.custom.min.js"></script>
		<script type="text/javascript" src="js/core_data.js"></script>
		<script type="text/javascript" src="js/deckbuilder.js"></script>
		<link rel="stylesheet" type="text/css" href="css/deckbuilder.css" />
		<link rel="stylesheet" type="text/css" href="css/ui-lightness/jquery-ui-1.10.0.custom.css" />
	</head>
<body>
	<div id="infoBox">
		<div id="tabs">
			<ul>
				<li><a href="#adminDiv"><span>Admin</span></a></li>
				<li><a href="#statisticsDiv"><span>Statistics</span></a></li>
				<li><a href="#cardsDiv"><span>Card Blocks</span></a></li>
				<li><a href="#helpDiv"><span>Help</span></a></li>
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
				<div id="mainLinkSaveAs" style='display:none;'>
					<a href="javascript:void(0)" onclick="user.saveAsDeck()">Save deck as ...</a>
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
			<div id="cardsDiv">
				<div>All:<input type="radio" name="show" value="all" checked="checked" onchange="cards.changeShow()" /> Selected:<input type="radio" name="show" value="sel" onchange="cards.changeShow()" /> Not:<input type="radio" name="show" value="not" onchange="cards.changeShow()" /> |
				 Un<input type="checkbox" name="show_unit" value="yes" checked="checked" onchange="cards.changeShow()" /> En<input type="checkbox" name="show_enhancement" value="yes" checked="checked" onchange="cards.changeShow()" /> Ev<input type="checkbox" name="show_event" value="yes" checked="checked" onchange="cards.changeShow()" /> Fa<input type="checkbox" name="show_fate" value="yes" checked="checked" onchange="cards.changeShow()" /> Ob<input type="checkbox" name="show_objective" value="yes" checked="checked" onchange="cards.changeShow()" /></div>
				<div id="selectedCardsDiv"></div>
			</div>
			<div id="helpDiv">
				<div>Statistics:</div>
				<ul>
					<li>Cost: Total play cost. ø = average play cost per Unit, Enhancement or Event card</li>
					<li>Force: Total available force icons. ø = average number of force icons per card in command deck</li>
					<li>Obj Resources: Total available resources from objectives. ø = average number of resource points per objective</li>
					<li>Oth Resources: Total available resources from non objectives. ø = average number of resource points per card in command deck</li>
					<li>Unit Dmg Capa: Total damage capacity from Unit cards. ø = average damage capacity on unit cards</li>
					<li>Types: Un = Unit, En = Enhacement, Ev = Event, Fa = Fate, ø = average amount of this type in command deck</li>
					<li>Affiliation: Ne = Neutral, Je = Jedi, Re = Rebell Alliance, Sm = Smugglers and Spies, Si = Sith, Im = Imperial Navy, Sc = Scum and Villainy, ø = average amount of this affiliation in command &amp; objective deck</li>
					<li>Combat Icons: UD = Unit Damage, BD = Blast Damage, T = Tactics, EE-UD = Edge-Unit Damage, EE-BD = Edge-Blast Damage, EE-T = Edge-Tactics, ø = average amount of this affiliation in command deck</li>
				</ul>
			</div>
		</div>
	</div>
	<div id="main"></div>	
</body>
</html>






