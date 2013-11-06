/**
 * Create Post
 *
 * @module     CreatePostView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define([ 'App', 'marionette', 'handlebars', 'underscore', 'alertify', 'text!templates/modals/CreatePost.html',
	'backbone-validation', 'backbone-forms/backbone-forms', 'forms/templates/FormTemplates', 'forms/editors/Location'],
	function( App, Marionette, Handlebars, _, alertify, template,
		BackboneValidation, BackboneForm)
	{
		return Marionette.ItemView.extend( {
			template: Handlebars.compile(template),
			initialize : function ()
			{
				// Set up the form
				this.form = new BackboneForm({
					model: this.model,
					idPrefix : 'post-',
					className : 'create-post-form',
					fieldsets : _.result(this.model, 'fieldsets')
					});
				BackboneValidation.bind(this, {
					valid: function(/* view, attr */)
					{
						// Do nothing, displaying errors is handled by backbone-forms
					},
					invalid: function(/* view, attr, error */)
					{
						// Do nothing, displaying errors is handled by backbone-forms
					}
				});

				// Trigger event when modal is fully opened, used to refresh map size
				this.on('modal:opened', function ()
				{
					this.form.trigger('dom:refresh');
				});
			},
			events: {
				'submit form' : 'formSubmitted',
				'click .js-switch-fieldset' : 'switchFieldSet'
			},
			onDomRefresh : function()
			{
				// Render the form and add it to the view
				this.form.render();

				// Set form id, backbone-forms doesn't do it.
				this.form.$el.attr('id', 'create-post-form');

				this.$('.post-form-wrapper').append(this.form.el);
			},
			formSubmitted : function (e)
			{
				var that = this,
					errors;

				e.preventDefault();

				errors = this.form.commit({ validate: true });

				if (! errors)
				{
					// @todo don't hard code locale
					this.model.set('locale', 'en_us');

					this.model.save()
						.done(function (model /*, response, options*/)
							{
								App.appRouter.navigate('posts/' + model.id, { trigger : true });
								that.trigger('close');
							})
						.fail(function (response /*, xhr, options*/)
							{
								alertify.error('Unable to save post, please try again.');
								// validation error
								if (response.errors)
								{
									// @todo Display this error somehow
								}
							});
				}
			},
			switchFieldSet : function (e)
			{
				var $el = this.$(e.currentTarget);
				this.$('fieldset').removeClass('active');
				this.$($el.attr('href')).addClass('active');

				e.preventDefault();
			},
			onClose : function ()
			{
				BackboneValidation.unbind(this);
			},
			serializeData: function()
			{
				var data = _.extend(this.model.toJSON(), {
					isPublished : this.model.isPublished(),
					tags : this.model.getTags(),
					user : this.model.user ? this.model.user.toJSON() : null,
					fieldsets : _.result(this.model, 'fieldsets')
				});
				return data;
			}
		});
	});
