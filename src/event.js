// See https://stackoverflow.com/questions/46745826/vuejs-setting-up-event-bus

import Vue from 'vue';

const EventBus = new Vue();

class Event {
  static highlightCurrentTocItem(id) {
    EventBus.$emit('highlight-current-toc-item', id);
  }
}

class EventListener {
  static highlightCurrentTocItem(callback) {
    EventBus.$on('highlight-current-toc-item', callback);
  }
}

export { Event, EventListener }
