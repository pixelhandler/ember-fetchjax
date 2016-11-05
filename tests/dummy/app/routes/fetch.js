import Ember from 'ember';
import FetchOrAjax from 'dummy/utils/fetchjax';

const fetchjax = new FetchOrAjax({ajax: Ember.$.ajax});

export default Ember.Route.extend({
  model() {
    return fetchjax.fetch('/api/v1/posts', {method: 'GET'});
  }
});

