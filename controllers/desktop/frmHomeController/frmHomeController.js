define({ 

  onViewCreated(){
    this.view.init = () => {
      this.initEvents();
    };

    this.view.preShow = () => {
      voltmx.application.showLoadingScreen(null, 'Loading data...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
      this.initData();
    };
  },

  initEvents(){
    //when selecting a country we load the list of cities belonging to that country in the city dropdown
    this.view.selCountry.onSelection = () => {
      const selectedCountry = this.view.selCountry.selectedKeyValues[0][0];
      const cityData = [];
      data.cities[selectedCountry].forEach((city) => {
        cityData.push([city, city]);
      });
      cityData.sort((a, b) => a[1] > b[1] ? 1 : -1);
      this.view.selCity.masterData = cityData;
    };

    //when we click the Add button we create a new entry in the Scheduled Events list. We also add the event to the local events store
    this.view.btnAdd.onClick = () => {
      const dateComponents = this.view.calDate.dateComponents;
      const event = {
        id: `event${new Date().getTime()}`,
        country: this.view.selCountry.selectedKeyValues ? this.view.selCountry.selectedKeyValues[0][1] : '',
        city: this.view.selCity.selectedKeyValues ? this.view.selCity.selectedKeyValues[0][1] : '',
        venue: this.view.txtVenue.text.trim(),
        date: `${dateComponents[0]}/${dateComponents[1]}/${dateComponents[2]}`
      };
      if(event.country && event.city && event.venue && event.date){
        const cmpScheduledEvent = new com.hcl.demo.marutisuzuki.ScheduledEvent({
          id: event.id
        }, {}, {});
        cmpScheduledEvent.isNew = true;
        cmpScheduledEvent.eventCity = event.city;
        cmpScheduledEvent.eventCountry = event.country;
        cmpScheduledEvent.eventVenue = event.venue;
        cmpScheduledEvent.eventDate = event.date;
        this.view.flxScheduledEvents.addAt(cmpScheduledEvent, 0);
        this.addEventToLocalData(event);
      } else {
        alert('All fields are required');
      }
    };

    //when we click the save button we save all the events stored in the local store
    this.view.btnSave.onClick = () => {
      const localEvents = JSON.parse(voltmx.store.getItem('scheduledEvents') || '[]');
      if(localEvents.length > 0){
        voltmx.application.showLoadingScreen(null, 'Saving data...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
        const objSvc = VMXFoundry.getObjectService('SuzukiMarutiObjSvc', {access: 'online'});
        const saveEvent = (index) => {
          if(index < localEvents.length){
            const event = localEvents[index];
            const eventsObj = new voltmx.sdk.dto.DataObject("Events");
            eventsObj.addField("id", event.id);
            eventsObj.addField("country", event.country);
            eventsObj.addField("city", event.city);
            eventsObj.addField("venue", event.venue);
            eventsObj.addField("eventDate", event.date);
            objSvc.create({dataObject: eventsObj}, () => saveEvent(++index), (error) => {
              voltmx.application.dismissLoadingScreen();
              alert('Error while saving data');
            });
          } else {
            voltmx.store.setItem('scheduledEvents', '[]');
            this.initData();
          }
        };
        saveEvent(0);
      }
    };
  },

  initData(){
    data.countries = {};
    data.cities = {};
    data.events = [];
    const objSvc = VMXFoundry.getObjectService('SuzukiMarutiObjSvc', {access: 'online'});
    const countriesObj = new voltmx.sdk.dto.DataObject("Countries");
    objSvc.fetch({dataObject: countriesObj}, (responseCountries) => {
      responseCountries.records.forEach((record) => data.countries[record.id] = record.name);
      const citiesObj = new voltmx.sdk.dto.DataObject("Cities");
      objSvc.fetch({dataObject: citiesObj}, (responseCities) => {
        responseCities.records.forEach((record) => {
          data.cities[record.country] = data.cities[record.country] || [];
          data.cities[record.country].push(record.name);
        });
        const eventsObj = new voltmx.sdk.dto.DataObject("Events");
        objSvc.fetch({dataObject: eventsObj}, (responseEvents) => {
          data.events = [...responseEvents.records];
          this.initWidgets();
          voltmx.application.dismissLoadingScreen();
        }, (errorEvents) => {
          voltmx.application.dismissLoadingScreen();
          alert(JSON.stringify(errorEvents));
        });
      }, (errorCities) => {
        voltmx.application.dismissLoadingScreen();
        alert(JSON.stringify(errorCities));
      });
    }, (errorCountries) => {
      voltmx.application.dismissLoadingScreen();
      alert(JSON.stringify(errorCountries));
    });
  },

  initWidgets(){
    //initialize the country dropdown
    const countryData = [];
    Object.keys(data.countries).forEach((country) => {
      countryData.push([country, data.countries[country]]);
    });
    countryData.sort((a, b) => a[1] > b[1] ? 1 : -1);
    this.view.selCountry.masterData = countryData;

    //the city dropdown is initially empty. It gets filled upon country selection
    this.view.selCity.masterData = [];
    
    //reset the Venue field
    this.view.txtVenue.text = '';

    //----- load the events -----
    this.view.flxScheduledEvents.removeAll();
    //first load the local events which haven't been saved to the db yet
    const localEvents = JSON.parse(voltmx.store.getItem('scheduledEvents') || '[]');
    localEvents.forEach((event) => {
      const cmpScheduledEvent = new com.hcl.demo.marutisuzuki.ScheduledEvent({
        id: event.id
      }, {}, {});
      cmpScheduledEvent.isNew = true;
      cmpScheduledEvent.eventCity = event.city;
      cmpScheduledEvent.eventCountry = event.country;
      cmpScheduledEvent.eventVenue = event.venue;
      cmpScheduledEvent.eventDate = event.date;
      this.view.flxScheduledEvents.add(cmpScheduledEvent);
    });
    //then load the events retrieved from the db
    data.events.forEach((event) => {
      const cmpScheduledEvent = new com.hcl.demo.marutisuzuki.ScheduledEvent({
        id: `event${new Date().getTime()}`
      }, {}, {});
      cmpScheduledEvent.isNew = false;
      cmpScheduledEvent.eventCity = event.city;
      cmpScheduledEvent.eventCountry = event.country;
      cmpScheduledEvent.eventVenue = event.venue;
      cmpScheduledEvent.eventDate = event.eventDate;
      this.view.flxScheduledEvents.add(cmpScheduledEvent);
    });
  },

  addEventToLocalData(event){
    const localEvents = JSON.parse(voltmx.store.getItem('scheduledEvents') || '[]');
    localEvents.push(event);
    voltmx.store.setItem('scheduledEvents', JSON.stringify(localEvents));
  }

});