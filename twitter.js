var Tweets = Backbone.Collection.extend({
	initialize: function(options) {
		this.query = options.query;
	},
	query: '',
	since_id: 0,
	max_id: 0,
	url: function() {
		return 'http://search.twitter.com/search.json?q=' + encodeURIComponent(this.query) + '&callback=?';
	},
	parse: function(resp, xhr) {
		return resp.results;
	}
});

var TweetsView = Backbone.View.extend({
	el: '#tweet_container',
	initialize: function(options) {
		this.template_id = options.template_id;
		this.collection = new Tweets(options);
	},
	render: function() {
		var self = this;
		this.collection.fetch({
			success: function(tweets) {
				var template_html = '<ul class="tweets"><% _.each(tweets, function(tweet){ %><li><%= tweet.get(\'text\') %></li><% }); %></ul>';
				$(self.el).append(_.template(template_html, {tweets: tweets.models}));
			}
		})
	}
});

$(document).ready(function($){
	var baconView = new TweetsView({template_id: 'tweet_template', query: '#bacon'});
	baconView.render();
});

