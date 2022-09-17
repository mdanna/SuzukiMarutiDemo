define(function() {

	return {
		constructor: function(baseConfig, layoutConfig, pspConfig) {
          
          this.view.preShow = () => {
            if(!this.initDone){
              this.view.flxBin.onClick = () => {
                this.view.isVisible = false;
              };
              this.initDone = true;
            }
            
            this.render();
          };

		},
		//Logic for getters/setters of custom properties
		initGettersSetters: function() {
            defineGetter(this, 'eventDate', () => {
                return this._eventDate;
            });
            defineSetter(this, 'eventDate', value => {
                this._eventDate = value;
            });
            defineGetter(this, 'eventVenue', () => {
                return this._eventVenue;
            });
            defineSetter(this, 'eventVenue', value => {
                this._eventVenue = value;
            });
            defineGetter(this, 'eventCity', () => {
                return this._eventCity;
            });
            defineSetter(this, 'eventCity', value => {
                this._eventCity = value;
            });
            defineGetter(this, 'eventCountry', () => {
                return this._eventCountry;
            });
            defineSetter(this, 'eventCountry', value => {
                this._eventCountry = value;
            });
        },
      
      render(){
        this.view.lblEvent.text = `Event on ${this.eventDate} at ${this.eventVenue} in ${this.eventCity}(${this.eventCountry})`;
        this.view.flxBin.isVisible = this.isNew;
      }
	};
});