core_data.getBlock = function(blockNo) {
	var retArray;
	$.each([this.Dark,this.Light], function() {
		//dark,light
		$.each(this.CardBlocks, function() {
			// array of {blockNo,cards}
			if(this.blockNo == blockNo) {
				retArray = this.cards;
			}
		});
	});
	return retArray;
}

function Cards() {

	this.onlyOnce = [35,36,17,18]
	this.affiliationRestrictions = [
		{affi:'Sith',blockNo:22},
		{affi:'Imperial Navy',blockNo:28},
		{affi:'Jedi',blockNo:4},
		{affi:'Rebel Alliance',blockNo:13}
	];

	this.reset();
}

Cards.prototype.reset = function() {
	this.affilication = "none";
	this.cardBlocks = [];
	this.resetStatistics();
}

Cards.prototype.resetStatistics = function() {
	this.totalCost = 0;
	this.totalForce = 0;
	this.totalObjectiveResources = 0;
	this.totalNonObjectiveResources = 0;
	this.totalUnitDmgCapacity = 0;	
	this.totalObjectiveResources = 0;
	this.totalAffiliationResources = this.affilication!='none'?1:0;
	this.totalNumCards = 0;
	this.totalCostCards = 0;
	this.totalUnitCards = 0;
	this.typesCounter = {};
	this.affiliatonCounter = {};
}

Cards.prototype.restrictSelections = function() {
	var self = this;
	$.each(this.affiliationRestrictions, function() {
		var affiliationRestriction = this;
		$("input[type=checkbox]").each(function() {
			if(affiliationRestriction.blockNo == this.name) {
				if(affiliationRestriction.affi == self.affilication) {
					this.disabled = false;
				} else {				
					this.selected = false;
					this.disabled = true;
				}
			}
		});
	});
}

Cards.prototype.calcStatistics = function() {
	this.resetStatistics();	
	var self = this;
	$.each(this.cardBlocks, function() {
		var cardArray = core_data.getBlock(this);
		$.each(cardArray, function() {
			self.totalCost += parseInt(this.Cost);
			self.totalForce += parseInt(this.Force);

			if(this.Type == 'Objective') {
				self.totalObjectiveResources += parseInt(this.Resources);
			} else {
				self.totalNonObjectiveResources += parseInt(this.Resources);
			}

			self.totalNumCards++;
			if(this.Type != 'Fate' && this.Type != 'Objective') {
				self.totalCostCards++;
			}
			if(this.Type == 'Unit') {
				self.totalUnitDmgCapacity += parseInt(this["Damage Capacity"]);
				self.totalUnitCards++;
			}

			if(this.Type != 'Objective') {
				if(typeof(self.typesCounter[this.Type]) == 'undefined') {
					self.typesCounter[this.Type] = 0;
				}
				self.typesCounter[this.Type]++;
			}

			if(typeof(self.affiliatonCounter[this.Affiliation]) == 'undefined') {
				self.affiliatonCounter[this.Affiliation] = 0;
			}
			self.affiliatonCounter[this.Affiliation]++;			
		})
	});	
	console.log(this.typesCounter);
}

Cards.prototype.updateSelectionModel = function() {
	var self = this;
	$("input[type=radio]").each(function() {
		if(this.checked) { 
			self.affilication = this.value;
		}
	});
	this.cardBlocks = [];
	$("input[type=checkbox]").each(function() {
		if(this.checked) {
			self.cardBlocks.push(this.name);
		}
	});
}

Cards.prototype.updateUi = function() {
	var self = this;
	var buff = '/gen.groovy?affi='+this.affilication+'&cards='+this.cardBlocks.toString();
	if(this.affilication!='none'&&this.cardBlocks.length>=10) {
		$("#out").html("<a href='"+buff+"'>Download your deck</a>"); 
	} else {
		$("#out").html("Deck not ready"); 
	}
	var typesStr = "";
	$.each(this.typesCounter, function(key, value) {
		if(typesStr.length>0) typesStr += ", ";
		typesStr += key.substring(0,2)+"="+value+" ("+Math.round(100*value/(self.cardBlocks.length*5))+"%)";
	})
	var affiliationStr = "";
	$.each(this.affiliatonCounter, function(key, value) {
		if(affiliationStr.length>0) affiliationStr += ", ";
		affiliationStr += key.substring(0,2)+"="+value+" ("+Math.round(100*value/(self.cardBlocks.length*6))+"%)";
	})
	$('#selected').html("Sets selected: "+this.cardBlocks.length+"<br/>"+
						"Cost: "+this.totalCost+" (avg:"+(this.totalCost/this.totalCostCards).toFixed(2)+")<br/>"+
						"Force: "+this.totalForce+" (avg:"+(this.totalForce/(this.cardBlocks.length*5)).toFixed(2)+")<br/>"+
						"Obj Resources: "+(this.totalAffiliationResources+this.totalObjectiveResources)+" (avg:"+(this.totalObjectiveResources/this.cardBlocks.length).toFixed(2)+")<br/>"+
						"Oth Resources: "+this.totalNonObjectiveResources+" (avg:"+(this.totalNonObjectiveResources/(this.cardBlocks.length*5)).toFixed(2)+")<br/>"+
						"Unit Dmg Capa: "+this.totalUnitDmgCapacity+" (avg:"+(this.totalUnitDmgCapacity/this.totalUnitCards).toFixed(2)+")<br/>"+
						"Cards: "+this.totalNumCards+"<br/>"+
						"Types: "+typesStr+"<br/>"+
						"Affiliation: "+affiliationStr+"<br/>"
						);	
}

Cards.prototype.selectionChanged = function() {
	this.updateSelectionModel();
	this.restrictSelections();
	this.calcStatistics();
	this.updateUi();
}

Cards.prototype.createSide = function (side) {
	$('#mainLink'+side).hide();
	$('#mainLink'+(side=='Dark'?'Light':'Dark')).show();
	$('#main').empty()
	this.reset();
	this.updateUi();

	// create Affiliations-Box
	var mainDiv = $("<div />").attr('class','affiBox');
	$("<div />").html("Affiliations for "+side).appendTo(mainDiv);
	$.each(core_data[side].Affiliation, function(index, value) {
		$("<input />").attr('type','radio').attr('name','affi').attr('value',value.name).attr('onchange','cards.selectionChanged()').appendTo(mainDiv);
		$("<img />").attr('src','tmp/'+value.fileName).appendTo(mainDiv);
	});
	$('#main').append(mainDiv);

	// create all Card-Boxs
	$.each(core_data[side].CardBlocks, function(index, value) {
		var mainDiv = $("<div />").attr('class','cardBox');
		var headerDiv = $("<div />").html("Block "+value.blockNo+" ")
		headerDiv.appendTo(mainDiv);
		$("<input />").attr('type','checkbox').attr('name',value.blockNo).attr('onchange','cards.selectionChanged()').appendTo(headerDiv);
		if($.inArray(value.blockNo, cards.onlyOnce)==-1) {
			$("<input />").attr('type','checkbox').attr('name',value.blockNo).attr('onchange','cards.selectionChanged()').appendTo(headerDiv);
		}
		$.each(value.cards, function(index, value) {
			var toAppendDiv = mainDiv;
			if(index == 0) {
				toAppendDiv = $("<div />").appendTo(mainDiv);
			}
			$("<img />").attr('src','tmp/'+value.fileName).appendTo(toAppendDiv);
		});
		$('#main').append(mainDiv);
	});
}

var cards = new Cards();