var Tweets = Backbone.Collection.extend({
	initialize: function(options) {
		this.query = options.query;
	},
	query: '',
	since_id: 0,
	max_id: 0,
	fetch_newer: true,
	url: function() {

		var url_base = 'http://search.twitter.com/search.json?q=' + encodeURIComponent(this.query);

		if (this.fetch_newer) {
			if (this.since_id) {
				url_base += '&since_id=' + this.since_id;
			}
		} else {
			if (this.max_id) {
				url_base += '&max_id=' + this.max_id;
			}
		}

		return url_base + '&callback=?';
	},
	parse: function(resp, xhr) {

		if ((0 == this.since_id) || (resp.max_id > this.since_id)) {
			this.since_id = resp.max_id;
		}

		if (resp.results.length) {
			var last_id = _.last(resp.results).id;
			if ((0 == this.max_id) || (last_id < this.max_id)) {
				this.max_id = last_id;
			}
		}

		return resp.results;
	},
	add: function(models, options) {
		var new_models = [];

		_.each(models, function(model) {
			if (model.id && _.isUndefined(this.get(model.id))) {
				new_models.push(model);
			}
		}, this);

		return Backbone.Collection.prototype.add.call(this, new_models, options);
	},
	comparator: function(a, b) {
		if (a.id > b.id) {
			return -1;
		} else {
			return 1;
		}
		return 0;
	}
});

var TweetsView = Backbone.View.extend({
	el: '#tweet_container',
	tagName: 'li',
	initialize: function(options) {
		this.template_id = options.template_id;
		this.collection = new Tweets(options);
	},
	render: function(newer) {
		var self = this;
		this.collection.fetch_newer = (newer || _.isUndefined(newer));
		this.collection.fetch({
			add: true,
			success: function(tweets) {
				var template_html = '<% _.each(tweets, function(tweet){ %><li><%= tweet.get(\'created_at\') %> - <%= tweet.get(\'text\') %></li><% }); %>';
				var rendered_template = _.template(template_html, {tweets: tweets.models});
				$(self.el).html(rendered_template);
			}
		})
	}
});

$(document).ready(function($){
	var tweetView = new TweetsView({template_id: 'tweet_template', query: '#bacon'});
	tweetView.render();

	$('#older_tweets').click(function(){
		tweetView.render(false);
	});

	$('#newer_tweets').click(function(){
		tweetView.render();
	});

});

