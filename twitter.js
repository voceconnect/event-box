var Tweets = Backbone.Collection.extend({
	initialize: function(options) {
		this.query = options.query;
	},
	query: '',
	since_id: 0,
	max_id: 0,
	fetch_newer: true,
	url: function() {

		url_base = 'http://search.twitter.com/search.json?q=' + encodeURIComponent(this.query);

		if (this.fetch_newer && this.since_id) {
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
		console.log(resp);
		this.since_id = resp.max_id;
		this.max_id = _.last(resp.results).id;
		return resp.results;
	}
});

var TweetsView = Backbone.View.extend({
	el: '#tweet_container',
	initialize: function(options) {
		this.template_id = options.template_id;
		this.collection = new Tweets(options);
	},
	render: function(newer) {
		var self = this;
		this.collection.fetch_newer = (newer || _.isUndefined(newer));
		this.collection.fetch({
			success: function(tweets) {
				var template_html = '<ul class="tweets"><% _.each(tweets, function(tweet){ %><li><%= tweet.get(\'created_at\') %> - <%= tweet.get(\'text\') %></li><% }); %></ul>';
				$(self.el).append(_.template(template_html, {tweets: tweets.models}));
			}
		})
	}
});

$(document).ready(function($){
	var tweetView = new TweetsView({template_id: 'tweet_template', query: '#bacon'});
	tweetView.render();

	$('#older_tweets').click(function(){
		tweetView.render(false);
	})

});

