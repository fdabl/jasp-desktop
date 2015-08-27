
JASPWidgets.Analyses = JASPWidgets.View.extend({

	initialize: function () {

		this.analyses = [];
		this.views = [];

		this.toolbar = new JASPWidgets.Toolbar({ className: "jasp-toolbar jasp-title-toolbar jasp_top_level" })
		this.toolbar.setParent(this);

		this.toolbar.title = 'Results';
		this.toolbar.titleTag = "h1";

		this.note = new JASPWidgets.Note();
		this.noteBox = new JASPWidgets.NoteBox({ className: "jasp-notes jasp-main-note jasp_top_level", model: this.note });

		this.listenTo(this.noteBox, "NoteBox:textChanged", function () {
			this.trigger("meta:noteChanged", 'first');
		});

		this.views.push(this.noteBox);
	},

	menuName: 'All',

	noteOptions: function () {
		var visible = this.noteBox.visible;
		var options = { key: 'main', menuText: 'Add Note', visible: visible };
		if (visible)
			options.menuText = 'Remove Note';

		return [options];
	},

	notesMenuClicked: function (noteType, visibility) {

		var noteBox = this.noteBox;
		noteBox.$el.css("opacity", visibility ? 0 : 1);

		if (visibility === true) {
			noteBox.$el.slideDown(200, function () {
				noteBox.setVisibility(visibility);
				noteBox.setGhostTextVisible(false);
				noteBox.$el.animate({ "opacity": 1 }, 200, "easeOutCubic", function () {
					window.scrollIntoView(noteBox.$textbox, function () {
						var pos = noteBox.simulatedClickPosition();
						window.simulateClick(pos.x, pos.y);
						noteBox.setGhostTextVisible(true);
					});
				});
			});
		}
		else {
			noteBox.$el.slideUp(200, function () {
				noteBox.setVisibility(visibility);
			});
		}
	},

	copyMenuClicked: function () {
		var exportParams = new JASPWidgets.Exporter.params();
		exportParams.format = JASPWidgets.ExportProperties.format.html;
		exportParams.process = JASPWidgets.ExportProperties.process.copy;
		exportParams.htmlImageFormat = JASPWidgets.ExportProperties.htmlImageFormat.temporary;
		exportParams.includeNotes = true;

		this.exportBegin(exportParams);

		return true;
	},

	editTitleClicked: function () {

	},

	events: {
		'mouseenter': '_hoveringStart',
		'mouseleave': '_hoveringEnd',
	},

	_hoveringStart: function (e) {
		this.toolbar.setVisibility(true);
	},

	_hoveringEnd: function (e) {
		this.toolbar.setVisibility(false);
	},

	addAnalysis: function(analysis) {
		this.analyses.push(analysis);
		this.views.push(analysis);

		analysis.$el.css("opacity", 0)
		this.$el.append(analysis.$el);
		analysis.$el.animate({ "opacity": 1 }, 400, "easeOutCubic")
	},

	removeAnalysis: function (analysis) {

		analysis.$el.animate({ opacity: 0 }, 400, "easeOutCubic", function () {
			analysis.$el.slideUp(400, function () {
				analysis.close();
				this.analyses = _.without(this.analyses, analysis);
				this.views = _.without(this.analyses, analysis);
			});
		});
	},

	removeAnalysisId: function (analysisId) {

		var analysis = this.getAnalysis(analysisId);
		if (analysis !== undefined) {
			this.removeAnalysis(analysis);
		}
	},

	getAnalysis: function(id) {
		return _.find(this.analyses, function (cv) { return cv.model.get("id") === id; });
	},

	getAnalysesNotes: function() {
		var notes = [];
		for (var i = 0; i < analysesViews.length; i++) {
			notes.push(analysesViews[i].getAnalysisNotes());
		}
		return notes;
	},

	getResultsMeta: function () {
		return {
			title: this.toolbar.title,
			notes: {
				first: {
					text: Mrkdwn.fromHtmlText(this.note.get('text')),
					format: 'markdown',
					visible: this.noteBox.visible
				}
			}
		};
	},

	setResultsMeta: function (resultsNotes) {

		var notes = resultsNotes['notes'];
		var title = resultsNotes['title'];
		var first = notes['first'];

		this.note.set(first);
		this.noteBox.setVisibility(first['visible']);
		this.toolbar.title = title;
		this.toolbar.render();
	},

	unselectAllAnalyses: function() {
		_.invoke(this.analyses, "unselect");
	},

	exportBegin: function (exportParams, completedCallback) {

		if (exportParams == undefined)
			exportParams = new JASPWidgets.Exporter.params();
		else if (exportParams.error)
			return false;

		var callback = this.exportComplete;
		if (completedCallback !== undefined)
			callback = completedCallback;

		return JASPWidgets.Exporter.begin(this, exportParams, callback, true);
	},

	exportComplete: function (exportParams, exportContent) {
		if (!exportParams.error)
			pushHTMLToClipboard(exportContent, exportParams);
	},

	render: function () {

		//var $titleSpace = $('<div class="jasp-report-title"><div>');

		this.toolbar.render();
		this.$el.append(this.toolbar.$el);

		this.noteBox.render();
		this.$el.append(this.noteBox.$el);

		//this.$el.append($titleSpace);
	},

	onClose: function () {
		this.toolbar.close();
		this.noteBox.close();
	}
});