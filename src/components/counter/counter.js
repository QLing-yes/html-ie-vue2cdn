define([
  'html!src/components/counter/index.html',
  'css!src/components/counter/index'
], function(template) {

  return {
    template: template,
    data: function() {
      return { count: 0 };
    },
    methods: {
      increment: function() { this.count++; },
      decrement: function() { this.count--; },
      reset:     function() { this.count = 0; }
    }
  };

});
