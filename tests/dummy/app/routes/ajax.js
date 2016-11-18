import Ember from 'ember';
import FetchOrAjax from 'ember-fetchjax/utils/fetchjax';

const fetchjax = new FetchOrAjax({useAjax: true, ajax: Ember.$.ajax});

export default Ember.Route.extend({
  model() {
    return fetchjax.fetch('/api/v1/posts', {method: 'GET'});
  }
});
