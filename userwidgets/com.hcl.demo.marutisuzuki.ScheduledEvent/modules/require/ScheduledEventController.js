define(function() {

  return {
    constructor(baseConfig, layoutConfig, pspConfig) {

      this.view.preShow = () => {
        if(!this.initDone){
          this.view.flxBin.onClick = () => {
            this.view.isVisible = false;
            const localEvents = JSON.parse(voltmx.store.getItem('scheduledEvents') || '[]');
            const newlocalEvents = localEvents.filter((event) => event.id !== this.view.id);
            voltmx.store.setItem('scheduledEvents', JSON.stringify(newlocalEvents));
          };
          this.initDone = true;
        }

        this.render();
      };

    },
    
    initGettersSetters() {
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