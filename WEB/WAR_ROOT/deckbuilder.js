function Cards() {

	this.affilication = "none";
	this.cardBlocks = [];

	this.onlyOnce = [35,36,17,18]
	this.affiliationRestrictions = [
		{affi:'Sith',blockNo:22},
		{affi:'Imperial Navy',blockNo:28},
		{affi:'Jedi',blockNo:4},
		{affi:'Rebel Alliance',blockNo:13}
	]

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
	var buff = '/gen.groovy?affi='+this.affilication+'&cards='+this.cardBlocks.toString();
	if(this.affilication!='none'&&this.cardBlocks.length>=10) {
		$("#out").html("<a href='"+buff+"'>Download your deck</a>"); 
	} else {
		$("#out").html("Deck not ready"); 
	}
	$('#selected').html("Sets selected:"+this.cardBlocks.length);	
}

Cards.prototype.selectionChanged = function() {
	this.updateSelectionModel();
	this.restrictSelections();
	this.updateUi();
}

Cards.prototype.createSide = function (side) {
	$('#mainLink'+side).hide();
	$('#mainLink'+(side=='Dark'?'Light':'Dark')).show();
	$('#main').empty()
	this.affilication = "none";
	this.cardBlocks = [];
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