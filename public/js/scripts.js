//Shops databases
let dataFiltered
let dataUnfiltered
let dataWithDeleted
//Airbnb databases
let airbnbFiltered
let airbnbUnfiltered
//Shop type mapping databases
let typesDatabase
let typesDatabaseDefault = []

//Current latitude and longitude of map
let mapX
let mapY

//Reference to the text popup
let abbrPopup = document.querySelector('#abbrPopup')
//References for the detail popups
var container = document.getElementById('popup')
var content = document.getElementById('popup-content')
var closer = document.getElementById('popup-closer')
var overlay
//The index of the current entry within the corresponding location's 'info' array
var popupIndex
let popupPresent = false

//Holds circles on the map
let newfeatures = []

//Globals to control the map display
let map
let layer
let styles = {}

//Globals containing the options currently selected by the main filters
let yearTargets = []
let sestiereTargets = []
let storeTargets = []

//Timelapse management globals
let timelapsing = false
let paused = false
let yearIndex = 0
let timelapseInterval;
let CYCLETIME = 2000

//Arrays containing all possible options for years, sestiere, and shop types
let allYears
let allTypes
let yearOptions
let sestiereOptions
let sestiereOptionsCopy
let storesOptions
let storesOptionsCopy

//References to the main filters
const yearFilterDefault = document.querySelector('#yearFilter').innerHTML
const sestiereFilterDefault = document.querySelector('#sestiereFilter').innerHTML
const storeFilterDefault = document.querySelector('#storeFilter').innerHTML
//References to the shops number and airbnb number display
const numDisplay = document.querySelector('#numberDisplay')
const airbnbNumDisplay = document.querySelector('#airbnbNumberDisplay')

//Default radius of circles
let radius = 5

//Abbreviations for each sestiere
const ABBRS = {
  "Cannaregio": "CN", "Castello": "CS", "San Marco": "SM", "Dorsoduro": "DD",
  "San Polo": "SP", "Santa Croce": "SC", "Giudecca": "GD"
}

//Mapping of all shop types to super-categories
const SHOPTYPES = {
  'Clothing Stores': ['Clothing', 'Costumes', "Children's Clothing", 'Gloves', "Men's Clothing", 'Shoes',
    'Undergarments', "Women's Clothing"],
  'Drug Stores': ['Cosmetics', 'Medical Goods', 'Pharmacy'],
  'Entertainment': ['Casino', 'Entertainment', 'Movie Theater'],
  'Food and Beverage': ['Bakery', 'Butcher', 'Candy', 'Coffee', 'Dairy', 'Gelateria', 'Liquor', 'Produce',
    'Seafood', 'Wine'],
  'Grocery Stores & Supermarkets': ['General Store', 'Grocery Store'],
  'Lodging': ['Bed and Breakfast', 'Guest Houses', 'Hotel', 'Hotel with Restaurant', 'Hostel'],
  'Restaurants & Bars': ['Bar', 'Cafe', 'Fast Food', 'Pizzeria', 'Restaurant'],
  'Services': ['Apartment Rental', 'Bank', 'Barber', 'Car Rental', 'Computer Services', 'Delivery', 'Dry Cleaner',
    'Electronics Repair', 'Film Studio', 'Fitness', 'Funeral Services', 'Graphic Design', 'Hair Salon', 'Hospital',
    'Jewelry Repair', 'Laundromat', 'Leather Repair', 'Library', 'Masseuse', 'Money Transfer', 'Nail Salon',
    'Perfume', 'Photo Store', 'Photocopy', 'Photographer', 'Post Office', 'Printing', 'Real Estate', 'Repair', 'Spa',
    'Study Agency', 'Swim', 'Tailor', 'Tattoo and Piercing', 'Transportation', 'Travel Agency', 'Veterinarian',
    'Warehouse', 'Wedding'],
  'Specialty Stores': ['Accessories', 'Antiques', 'Art', 'Art Gallery', 'Boat Supplies', 'Books',
    'Coins and Stamps', 'Computer', 'Electrical Appliances', 'Electronics', 'Exchange', 'Eyewear', 'Fishing',
    'Florist', 'Furniture', 'Glass', 'Hardware', 'Household Goods', 'Jewelry', 'Knives', 'Leather Goods',
    'Light Store', 'Luxury', 'Mask', 'Metal Work', 'Music', 'Musical Instruments', 'Newspaper', 'Office Supplies',
    'Pawn Shop', 'Pet Store', 'Picture Frames', 'Souvenirs', 'Sporting Goods', 'Stationery', 'Tobacco', 'Textiles',
    'Toys', 'Woodwork', 'Other Retail'],
  'Other': ['Closed', 'Undefined', 'Radio and Television', 'Stall']
}

//Mapping of super-categories to circle colors
const COLORS = {
  "Clothing Stores": "#2E86C1", "Drug Stores": "#2E86C1", "Entertainment": "#8E44AD",
  "Food and Beverage": "#F39C12", "Grocery Stores & Supermarkets": "#F39C12",
  "Lodging": "#378805", "Restaurants & Bars": "#F39C12", "Services": "#99A3A4",
  "Specialty Stores": "#2E86C1", "Other": "#000000", "airbnb": "#C0392B"
}

//Constant determining what types are artisan
const ARTISANTYPES = [
  'Mask', 'Bakery', 'Butcher', 'Pizzeria', 'Barber', 'Hair Salon', 'Jewelry Repair', 'Leather Repair', 'Masseuse',
  'Nail Salon', 'Spa', 'Tailor', 'Tattoo and Piercing', 'Wedding', 'Antiques', 'Florist', 'Glass', 'Jewelry',
  'Knives', 'Leather Goods', 'Pawn Shop', 'Woodwork', 'Picture Frames'
]

//Global contstants continued
const MINZOOM = 14.8
const MAXZOOM = 25
const CENTERX = 12.34
const CENTERY = 45.436
const WEST = 12.2915
const EAST = 12.379
const NORTH = 45.453
const SOUTH = 45.412

//Determines all years, sestiere, and types being used
function setBaselines() {
  //Resets globals so data is not duplicated when globals are repopulated
  allYears = []
  allTypes = []
  yearOptions = []
  sestiereOptions = []
  sestiereOptionsCopy = []
  storesOptions = []
  storesOptionsCopy = []

  //Iterates over all shops locations
  for (let i = 0; i < dataUnfiltered.length; i++) {
    //Iterates over all entries for each location
    for (let j = 0; j < dataUnfiltered[i].info.length; j++) {
      if (dataUnfiltered[i].info[j].year_collected !== "" && !allYears.includes(String(dataUnfiltered[i].info[j].year_collected))) {
        //Adds the year of the entry to the set of all years if it is not there already
        allYears.push(String(dataUnfiltered[i].info[j].year_collected))
      }
    }
  }
  //Iterates over all airbnb locations
  for (let i = 0; i < airbnbUnfiltered.length; i++) {
    //Iterates over the set of years for each airbnb location
    for (let j = 0; j < airbnbUnfiltered[i].years.length; j++) {
      if (!allYears.includes(String(airbnbUnfiltered[i].years[j])) && !allYears.includes(String(airbnbUnfiltered[i].years[j]) + ' (Airbnb only)')) {
        //Adds the year of the entry to the set of all years if it is not there already
        //Years that exist in the airbnb database and not the shops database are entered with the tag '(Airbnb only)' 
        allYears.push(String(airbnbUnfiltered[i].years[j]) + ' (Airbnb only)')
      }
    }
  }

  //Creates an 'option' html element for each year that the year filter can use 
  allYears = allYears.sort().reverse()
  for (let i = 0; i < allYears.length; i++) {
    const yearOpt = document.createElement('option')
    yearOpt.value = yearOpt.text = allYears[i]
    yearOptions.push(yearOpt)
  }

  //Creates an 'option' html element for each sestiere that the sestiere filter can use 
  //Also creates a duplicate set of options for the dropdowns in the detail popups to use to avoid conflict
  let sestiereNames = Object.keys(ABBRS).sort()
  for (let i = 0; i < sestiereNames.length; i++) {
    const sesOpt = document.createElement('option')
    sesOpt.value = sesOpt.text = sestiereNames[i]
    sestiereOptions.push(sesOpt)
    const sesOpt2 = document.createElement('option')
    sesOpt2.value = sesOpt2.text = sestiereNames[i]
    sestiereOptionsCopy.push(sesOpt2)
  }

  //Grabs the name of each super-category
  const keys = Object.keys(SHOPTYPES)
  //Iterates over each of the super-categories
  for (let i = 0; i < keys.length; i++) {
    //Creates an 'optgroup' element corresponding to each super-category
    //Also creates a duplicate for the duplicate set of options
    const shopOptG = document.createElement('optgroup')
    shopOptG.label = keys[i]
    shopOptG.id = "red"
    const shopOptG2 = document.createElement('optgroup')
    shopOptG2.label = keys[i]
    shopOptG2.id = "red"

    //Creates an 'option' (and a duplicate) for each type within the given super-category
    //Adds the 'options' as children of the 'optgroups'
    for (let j = 0; j < SHOPTYPES[keys[i]].length; j++) {
      const shopOpt = document.createElement('option')
      shopOpt.value = shopOpt.text = SHOPTYPES[keys[i]][j]
      shopOptG.appendChild(shopOpt)

      const shopOpt2 = document.createElement('option')
      shopOpt2.value = shopOpt2.text = SHOPTYPES[keys[i]][j]
      shopOptG2.appendChild(shopOpt2)

      allTypes.push(SHOPTYPES[keys[i]][j])
    }
    //Adds the populated 'optgroups' to the array of options for the shop type filter to use
    storesOptions.push(shopOptG)
    storesOptionsCopy.push(shopOptG2)
  }
}

//Transforms the shops and airbnb data into features that can be displayed on a map
function setFeatures() {
  //Resets the features
  newfeatures = []
  let numcount = 0

  //Iterates over all airbnb data in the filtered database
  for (let i = 0; i < airbnbFiltered.length; i++) {
    //Only creates features for airbnb locations with non-empty 'years' arrays
    if (airbnbFiltered[i].years.length > 0) {
      //Creates a feature for every airbnb and appends it to the list of features
      //Each feature stores its shape, the years that the airbnb existed for, the sestiere it's in,
      //and an identifier that classifies it as an airbnb feature rather than a shops feature
      let next = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([airbnbFiltered[i].lng, airbnbFiltered[i].lat])),
        years: airbnbFiltered[i].years,
        sestiere: airbnbFiltered[i].address_sestiere,
        type: "airbnb"
      })
      newfeatures.push(next)
    }
  }
  //Iterates over all shops data in the filtered database
  for (let i = 0; i < dataFiltered.length; i++) {
    //Only creates features for shops with non-empty 'info2' arrays
    if (dataFiltered[i].info2.length !== 0) {
      //Creates a feature for every shop and appends it to the list of features
      //Each feature stores its shape, the id that corresponds to the point in the MongoDB database,
      //the address, the parent_id (the id that connects locations to entries), the name that the store
      //had in the most recent entry, an array of data about each entry, and an identifier that 
      //classifies it as a shops feature rather than an airbnb feature
      let next = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([dataFiltered[i].lng, dataFiltered[i].lat])),
        _id: dataFiltered[i]._id,
        address: dataFiltered[i]["address_sestiere"] + " " + dataFiltered[i]["address_num"],
        address_street: dataFiltered[i]["address_street"],
        address_abbr: ABBRS[dataFiltered[i]["address_sestiere"]] + " " + dataFiltered[i]["address_num"],
        parent_id: dataFiltered[i].parent_id,
        last_name: dataFiltered[i].info[dataFiltered[i].info.length - 1].store_name,
        info: dataFiltered[i].info,
        type: "shop"
      })
      newfeatures.push(next)
      //Counter that increments once for each shop added to the array
      numcount = numcount + 1
    }
  }

  //Updates the number displays to reflect the number of features created
  numDisplay.innerText = numcount
  airbnbNumDisplay.innerText = newfeatures.length - numcount
}

//Function to close the detail popup
function removePopup() {
  popupPresent = false
  //Resets the types database to its default (default is changed if a change to the database is submitted)
  typesDatabase = JSON.parse(JSON.stringify(typesDatabaseDefault))
  overlay.setPosition(undefined);
  closer.blur();
}

//Function to replace the details on a popup with a 'Loading' message
function loadingPopup() {
  content.innerHTML = "<h1>Loading...</h1>"
}

//Defines more properties of the popup
function setPopup() {
  closer.onclick = function () {
    removePopup()
    return false;
  };
}

//Creates the map and centers and zooms on Venice
function setMap() {
  //Creates the map object, uses minimalist mapbox map, uses global constants to determine center and zoom
  map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults({ attribution: false }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA#1.07/0/0'
        })
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([CENTERX, CENTERY]),
      zoom: MINZOOM
    })
  });

  //Click event listener
  map.on('singleclick', function (event) {
    //Checks if there is a circle at the clicked location that represents a shop
    if (map.hasFeatureAtPixel(event.pixel) && map.getFeaturesAtPixel(event.pixel)[0].A.type === 'shop') {
      popupPresent = true
      abbrPopup.innerText = ''
      //Grabs the information from the feature
      let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
      //Sets the global index to the index of the most recent entry
      popupIndex = pointInfo.info.length - 1
      //Populates the detail popup with info from the feature
      setContent(pointInfo)
    }
    else {
      //Removes the popup if there is not a shops feature at the clicked location
      //Does nothing if there is no popup currently being displayed
      removePopup()
    }
  });

  //Moving the cursor event listener
  map.on('pointermove', function (event) {
    //If there is not a popup being displayed, checks if there is a circle at the location 
    //of the cursor that represents a shop
    if (!popupPresent && map.hasFeatureAtPixel(event.pixel) && map.getFeaturesAtPixel(event.pixel)[0].A.type === 'shop') {
      //Grabs the information from the feature
      let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
      //Only changes the content of the abbreviation popup if the feature is different than
      //it was when last checked
      if (abbrPopup.innerText !== pointInfo.address) {
        //Sets the position of the abbreviation popup (just a line of text, no background)
        //to the position of the cursor
        abbrPopup.style.top = event.originalEvent.pageY + 'px'
        abbrPopup.style.left = event.originalEvent.pageX + 'px'
        //Sets the abbreviation popup text to the last name if it exists, sets it to the
        //abbreviated address otherwise
        abbrPopup.innerText = (pointInfo.last_name === '') ? pointInfo.address_abbr : pointInfo.last_name
      }
    }
    else {
      //Removes the text of the abbreviation popup if there is not a valid feature at the cursor
      abbrPopup.innerText = ''
    }
  })

  //Start moving or scrolling map event listener
  map.on('movestart', function (e) {
    removePopup()
  })

  //Finish moving or scrolling map event listener
  map.on('moveend', function (e) {
    //Stores the location of the center of the map globally
    mapX = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[0]
    mapY = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[1]

    //Binds the boundries of the map to the general boundries of the historical city of Venice
    if (mapX < WEST) { mapX = WEST }
    if (mapX > EAST) { mapX = EAST }
    if (mapY > NORTH) { mapY = NORTH }
    if (mapY < SOUTH) { mapY = SOUTH }

    //Moves the map to the new location if recentering was necessary
    map.getView().setCenter(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'));

    //Binds the zoom of the map to reasonable levels
    if (map.getView().getZoom() < MINZOOM) {
      map.getView().setZoom(MINZOOM)
      map.getView().setCenter(ol.proj.transform([CENTERX, CENTERY], 'EPSG:4326', 'EPSG:3857'));
    }
    if (map.getView().getZoom() > MAXZOOM) {
      map.getView().setZoom(MAXZOOM)
    }
  });

  //Defines the overlay used by the detail popup
  overlay = new ol.Overlay({
    element: container
  });
  map.addOverlay(overlay);
}

//Establishes the dictionary of possible styles that points can have
function setStyles() {
  //Grabs and iterates over the names of all super-categories and 'airbnb'
  let colorkeys = Object.keys(COLORS)
  for (let i = 0; i < colorkeys.length; i++) {
    //Essentially transparent fill
    let fill = new ol.style.Fill({
      color: 'rgba(255,255,255,0.4)'
    });
    //Creates a 'stroke' object to set the color of a circle to the corresponding color in the 'COLORS' dict
    let stroke = new ol.style.Stroke({
      color: COLORS[colorkeys[i]],
      width: 1.75
    });
    //Creates a new style with the previously defined properties
    //Uses the 'radius' global to determine the radius for shops, half of 'radius' otherwise
    //Stores the style in the 'styles' global dict, key is the name of the super-category
    styles[colorkeys[i]] = new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: (colorkeys[i] !== "airbnb") ? radius : radius / 2
      }),
      fill: fill,
      stroke: stroke
    })
  }
  //Iterates over the names of all super-categories again, this time to establish the styles of points
  //collected in the most recent year
  for (let i = 0; i < colorkeys.length; i++) {
    //Creates a fill with the same color as the circle
    let fill = new ol.style.Fill({
      color: COLORS[colorkeys[i]]
    });
    //Makes the fill color slightly transparent
    fill.setColor(fill.getColor() + '80')
    //Creates a 'stroke' object to set the color of a circle to the corresponding color in the 'COLORS' dict
    let stroke = new ol.style.Stroke({
      color: COLORS[colorkeys[i]],
      width: 1.75
    });
    //Creates a new style with the previously defined properties
    //Uses the 'radius' global to determine the radius
    //Stores the style in the 'styles' global dict, key is the name of the 
    //super-category with 'new' appended to the end
    styles[colorkeys[i] + 'new'] = new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: radius
      }),
      fill: fill,
      stroke: stroke
    })
  }
}

//Populates the map with features
function addLayer() {
  //Iterates over all features
  for (let i = 0; i < newfeatures.length; i++) {
    //Handles shops features
    if (newfeatures[i].A.type === "shop") {
      let categories = Object.keys(SHOPTYPES)
      //Iterates over all super-categories to determine super-category of a given shop
      for (let j = 0; j < categories.length; j++) {
        //Checks if the most recent entry for the shop matches each super-category
        if (SHOPTYPES[categories[j]].includes(newfeatures[i].A.info[newfeatures[i].A.info.length - 1].store_type)) {
          //Sets the style of the feature based on the super-category
          //Checks if the most recent entry for the location was in the most recent year, uses
          //the filled style if so, normal style otherwise
          if (newfeatures[i].A.info[newfeatures[i].A.info.length - 1].year_collected === parseInt(allYears[0])) {
            newfeatures[i].setStyle(styles[categories[j] + "new"])
          }
          else { newfeatures[i].setStyle(styles[categories[j]]) }
          break;
        }
      }
    }
    else {
      //Uses the 'airbnb' style for all non-shop features
      newfeatures[i].setStyle(styles['airbnb'])
    }
  }

  //Creates a data layer to display all features
  layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: newfeatures
    })
  });
  //Adds the populated layer to the map
  map.addLayer(layer);
}

//Populates the detail popup
function setContent(pointInfo) {
  //Clears the content of the popup
  content.innerHTML = ""

  //Grabs the 'info' array from the selected location
  let information = pointInfo.info
  //Grabs the 'info' array that corresponds to the location's data in the 'dataWithDeleted' array
  //to ensure that entries marked for deletion are not overwritten when changes are submitted
  let informationPlusDeleted = []
  for (let i = 0; i < dataWithDeleted.length; i++) {
    if (pointInfo._id === dataWithDeleted[i]._id) {
      informationPlusDeleted = dataWithDeleted[i].info
    }
  }
  //Stores the element of the 'info' array specified by the global index
  let currInfo = information[popupIndex]

  //Creates an 'edit' button in the top left corner of the popup, adds the pencil icon
  const editButton = document.createElement("button");
  editButton.classList.add('outerIcon')
  editButton.innerHTML = '<img class="icons" src="./assets/pencil.png"/>'
  //Button press event listener
  editButton.onclick = function () {
    //Clears the content of the popup
    content.innerHTML = ""

    //Displays the picture associate with the entry
    const imagePreview = document.createElement("img")
    imagePreview.setAttribute("class", "imagePreview")
    imagePreview.setAttribute("src", currInfo.image_url)
    //Creates an input to allow new images to be submitted
    const imageInput = document.createElement("input")
    imageInput.setAttribute("type", "file")
    imageInput.setAttribute("accept", "image/png, image/jpeg")
    imageInput.setAttribute("id", "imageInput")
    imageInput.onchange = function () {
      imagePreview.setAttribute("src", URL.createObjectURL(imageInput.files[0]))
    }
    content.appendChild(imagePreview)
    content.appendChild(imageInput)
    content.appendChild(document.createElement("br"))

    //Creates a grid to standardize the format of the subsequent inputs
    const inputGrid = document.createElement("div")
    inputGrid.classList.add("inputGrid")

    //Creates a label, input, and clear button for the name of the entry
    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Name:"
    inputGrid.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    //Input defaults to current value of name
    nameInput.value = currInfo.store_name
    inputGrid.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function () { nameInput.value = "" }
    inputGrid.appendChild(clearName)

    //Creates a label, input, and clear button for the year of the entry
    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year:"
    inputGrid.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    //Input defaults to current value of year
    yearInput.value = currInfo.year_collected
    inputGrid.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    inputGrid.appendChild(clearYear)

    //Creates a label, dropdown, and clear button for the type of the entry
    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Type:"
    inputGrid.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    //Adds each option from the copy of the store type options array 
    for (let i = 0; i < storesOptionsCopy.length; i++) {
      storeInput.add(storesOptionsCopy[i])
    }
    //Dropdown defaults to current value of store type
    storeInput.value = currInfo.store_type
    inputGrid.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    //Clear button sets type to 'Closed'
    clearStore.onclick = function () { storeInput.value = "Closed" }
    inputGrid.appendChild(clearStore)

    //Creates a label, input, and clear button for the note of the entry
    const noteLabel = document.createElement("label")
    noteLabel.setAttribute("for", "noteInput")
    noteLabel.innerText = "Note:"
    inputGrid.appendChild(noteLabel)
    const noteInput = document.createElement("input")
    noteInput.setAttribute("id", "noteInput")
    noteInput.setAttribute("name", "noteInput")
    //Input defaults to current value of note
    noteInput.value = currInfo.note
    inputGrid.appendChild(noteInput)
    const clearNote = document.createElement("button")
    clearNote.innerText = "Clear"
    clearNote.onclick = function () { noteInput.value = "" }
    inputGrid.appendChild(clearNote)
    //Adds the grid to the popup
    content.appendChild(inputGrid)

    //Creates a checkbox to allow entries to be flagged
    const flagLabel = document.createElement("label")
    flagLabel.setAttribute("for", "flagbox")
    flagLabel.innerText = "Flagged"
    content.appendChild(flagLabel)
    const flagBox = document.createElement("input")
    flagBox.setAttribute("type", "checkbox")
    flagBox.setAttribute("id", "flagbox")
    flagBox.setAttribute("name", "flagBox")
    //Checkbox is already checked if the entry was flagged before the button was pressed, unchecked otherwise
    flagBox.checked = currInfo.flagged
    content.appendChild(flagBox)
    content.appendChild(document.createElement("br"))
    content.appendChild(document.createElement("br"))

    //Creates a button to cancel all edits
    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("textButton")
    cancelButton.classList.add("leftButton")
    //Button press event listener, repopulates the popup with the entry's information
    cancelButton.onclick = function () { setContent(pointInfo) }
    content.appendChild(cancelButton)

    //Creates a button to submit all edits
    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("textButton")
    submitButton.classList.add("rightButton")
    //Button press event listener
    submitButton.onclick = function () {
      //Does not submit the edit if a number is not entered in the 'Year Collected' input or the 
      //entry is flagged but no note is provided 
      if (isNaN(yearInput.value)) {
        alert("Year Collected must be a number")
      }
      else if (flagBox.checked && noteInput.value === '') {
        alert("A flagged entry requires a note")
      }
      else {
        //Displays a loading message while the edit is submitted and the points are regrabbed
        loadingPopup()
        //Enters the image upload process if an image is included in the edit
        if (imageInput.files.length !== 0) {
          //Creates a new form for image submission, populates with the inputted image
          const formData = new FormData()
          formData.append('myFile', imageInput.files[0])
          //Calls the '/uploadLocal' method
          fetch("/uploadLocal", {
            method: "POST",
            body: formData
          })
            .then(response => response.json())
            .then(data => {
              //Object to facilitate Google Drive upload
              const imgUpload = {
                imgName: yearInput.value + pointInfo.address,
                parents: "",
                imgsrc: data.path
              }
              //Calls '/upload' method
              fetch("/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(imgUpload)
              })
                .then(function (response) {
                  return response.json()
                })
                .then(function (response) {
                  //All information needed to update the entry
                  //The 'info' property is set equal to 'informationPlusDeleted' so that when 
                  //the 'info' array of the location is replaced with the new modified value, 
                  //the entries that have been marked for deletion in the past are not overwritten
                  const addedJSON = {
                    _id: pointInfo._id,
                    parent_id: pointInfo.parent_id,
                    address: pointInfo.address,
                    address_street: pointInfo.address_street,
                    info: informationPlusDeleted,
                    name: nameInput.value,
                    note: noteInput.value,
                    flagged: flagBox.checked,
                    image: response.data.webContentLink,
                    year: parseInt(yearInput.value, 10),
                    store: storeInput.value,
                    group: "Undefined",
                    nace: "Undefined",
                    index: popupIndex
                  }
                  //Calls '/edit' method
                  fetch("/edit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addedJSON)
                  })
                    .then(function () {
                      //Saves the id of the location to allow the popup to be found and displayed
                      //after data is regrabbed from Mongodb
                      const savedId = pointInfo._id
                      const editing = new Promise((request, response) => {
                        //Removes all features from the map
                        map.removeLayer(layer)
                        //Calls '/load' method
                        fetch("/load", {
                          method: "GET"
                        })
                          .then(function (response) {
                            return response.json()
                          })
                          .then(function (json) {
                            //Clears the shops databases
                            dataFiltered = []
                            dataWithDeleted = []
                            //Iterates over every location grabbed from MongoDB
                            for (let i = 0; i < json.length; i++) {
                              //Grabs all entries from the location that have not been marked for deletion
                              const newInfo = []
                              for (let j = 0; j < json[i].info.length; j++) {
                                if (!json[i].info[j].deleted) { newInfo.push(json[i].info[j]) }
                              }
                              //Adds the data to the shops databases
                              if (newInfo.length > 0) {
                                //Adds the location with its non-deleted entries to dataFiltered
                                const newInsert = json[i]
                                newInsert.info = newInfo
                                //Creates a duplicate of the 'info' object for filtering purposes
                                newInsert.info2 = newInfo
                                dataFiltered.push(newInsert)
                                //Adds the location with its deleted and non-deleted entries to dataWithDeleted
                                const newInsertPlusDeleted = json[i]
                                dataWithDeleted.push(newInsertPlusDeleted)
                              }
                            }
                            //Copies dataFiltered to dataUnfiltered
                            dataUnfiltered = JSON.parse(JSON.stringify(dataFiltered))
                            return 0
                          })
                          .then(function () {
                            //Call all functions necessary to reflect changes and redisplay the data
                            setBaselines()
                            setFeatures()
                            setYearFilter()
                            setStoreFilter()
                            filterFeatures()
                            return 0
                          })
                          .then(function () {
                            //Finds the location that was just edited
                            for (let i = 0; i < newfeatures.length; i++) {
                              if (newfeatures[i].A._id === savedId) {
                                //Repopulates the detail popup with the newly edited entry
                                setContent(newfeatures[i].A)
                                break
                              }
                            }
                            return 0
                          })
                      })
                      return 0
                    })
                })
            })
        }
        else {
          //Skips the image upload process if no image is added to the edit
          //Stores all necessary info for an edit
          const addedJSON = {
            _id: pointInfo._id,
            parent_id: pointInfo.parent_id,
            address: pointInfo.address,
            address_street: pointInfo.address_street,
            info: informationPlusDeleted,
            name: nameInput.value,
            note: noteInput.value,
            flagged: flagBox.checked,
            image: currInfo.image_url,
            year: parseInt(yearInput.value, 10),
            store: storeInput.value,
            group: "Undefined",
            nace: "Undefined"
          }
          //Calls '/edit' method
          fetch("/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(addedJSON)
          })
            .then(function () {
              //Saves the id of the location to allow the popup to be found and displayed
              //after data is regrabbed from Mongodb
              const savedId = pointInfo._id
              const editing = new Promise((request, response) => {
                //Removes all features from the map
                map.removeLayer(layer)
                //Calls '/load' method
                fetch("/load", {
                  method: "GET"
                })
                  .then(function (response) {
                    return response.json()
                  })
                  .then(function (json) {
                    //Clears the shops databases
                    dataFiltered = []
                    dataWithDeleted = []
                    //Iterates over every location grabbed from MongoDB
                    for (let i = 0; i < json.length; i++) {
                      //Grabs all entries from the location that have not been marked for deletion
                      const newInfo = []
                      for (let j = 0; j < json[i].info.length; j++) {
                        if (!json[i].info[j].deleted) { newInfo.push(json[i].info[j]) }
                      }
                      //Adds the data to the shops databases
                      if (newInfo.length > 0) {
                        //Adds the location with its non-deleted entries to dataFiltered
                        const newInsert = json[i]
                        newInsert.info = newInfo
                        //Creates a duplicate of the 'info' object for filtering purposes
                        newInsert.info2 = newInfo
                        dataFiltered.push(newInsert)
                        //Adds the location with its deleted and non-deleted entries to dataWithDeleted
                        const newInsertPlusDeleted = json[i]
                        dataWithDeleted.push(newInsertPlusDeleted)
                      }
                    }
                    //Copies dataFiltered to dataUnfiltered
                    dataUnfiltered = JSON.parse(JSON.stringify(dataFiltered))
                    return 0
                  })
                  .then(function () {
                    //Call all functions necessary to reflect changes and redisplay the data
                    setBaselines()
                    setFeatures()
                    setYearFilter()
                    setStoreFilter()
                    filterFeatures()
                    return 0
                  })
                  .then(function () {
                    //Finds the location that was just edited
                    for (let i = 0; i < newfeatures.length; i++) {
                      if (newfeatures[i].A._id === savedId) {
                        //Repopulates the detail popup with the newly edited entry
                        setContent(newfeatures[i].A)
                        break
                      }
                    }
                    return 0
                  })
              })
              return 0
            })
        }
      }
    }
    content.appendChild(submitButton)
  }

  //Creates an 'add' button in the top middle of the popup, adds the plus icon
  const plusButton = document.createElement("button")
  plusButton.classList.add('outerIcon')
  plusButton.innerHTML = '<img class="icons" src="./assets/plus.png"/>'
  //Button press event listener
  plusButton.onclick = function () {
    //Clears the content of the popup
    content.innerHTML = ""

    //Displays a preview of the inputted image, empty by default
    const imagePreview = document.createElement("img")
    imagePreview.setAttribute("class", "imagePreview")
    content.appendChild(imagePreview)
    //Creates an input that can be used to select an image to associate with the new entry
    const imageInput = document.createElement("input")
    imageInput.setAttribute("type", "file")
    imageInput.setAttribute("accept", "image/png, image/jpeg")
    imageInput.setAttribute("id", "imageInput")
    imageInput.onchange = function () {
      imagePreview.setAttribute("src", URL.createObjectURL(imageInput.files[0]))
    }
    content.appendChild(imageInput)
    content.appendChild(document.createElement("br"))

    //Creates a grid to standardize the format of the subsequent inputs
    const inputGrid = document.createElement("div")
    inputGrid.classList.add("inputGrid")

    //Creates an input for the store name
    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Name:"
    inputGrid.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    //Defaults to the name of the most recent entry at the associated location
    nameInput.value = currInfo.store_name
    inputGrid.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function () { nameInput.value = "" }
    inputGrid.appendChild(clearName)

    //Creates an input for the year of the entry
    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year:"
    inputGrid.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    //Defaults to the year in which the entry is being created
    yearInput.value = new Date().getFullYear()
    inputGrid.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    inputGrid.appendChild(clearYear)

    //Creates a dropdown to select the shop types
    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Type:"
    inputGrid.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    for (let i = 0; i < storesOptionsCopy.length; i++) {
      storeInput.add(storesOptionsCopy[i])
    }
    //Defaults to the most recent type
    storeInput.value = currInfo.store_type
    inputGrid.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function () { storeInput.value = "Closed" }
    inputGrid.appendChild(clearStore)

    //Creates an input for a note, defaults to empty
    const noteLabel = document.createElement("label")
    noteLabel.setAttribute("for", "noteInput")
    noteLabel.innerText = "Note:"
    inputGrid.appendChild(noteLabel)
    const noteInput = document.createElement("input")
    noteInput.setAttribute("id", "noteInput")
    noteInput.setAttribute("name", "noteInput")
    inputGrid.appendChild(noteInput)
    const clearNote = document.createElement("button")
    clearNote.innerText = "Clear"
    clearNote.onclick = function () { noteInput.value = "" }
    inputGrid.appendChild(clearNote)
    content.appendChild(inputGrid)

    //Creates a checkbox for flagging entries
    const flagLabel = document.createElement("label")
    flagLabel.setAttribute("for", "flagbox")
    flagLabel.innerText = "Flagged"
    content.appendChild(flagLabel)
    const flagBox = document.createElement("input")
    flagBox.setAttribute("type", "checkbox")
    flagBox.setAttribute("id", "flagbox")
    flagBox.setAttribute("name", "flagBox")
    flagBox.checked = currInfo.flagged
    content.appendChild(flagBox)
    content.appendChild(document.createElement("br"))
    content.appendChild(document.createElement("br"))

    //Creates a button for cancelling the submission of the new entry
    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("textButton")
    cancelButton.classList.add("leftButton")
    //Button press event listener, resets the detail view to show the most recent entry
    cancelButton.onclick = function () { setContent(pointInfo) }
    content.appendChild(cancelButton)

    //Creates a button to submit the new entry to the database
    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("textButton")
    submitButton.classList.add("rightButton")
    //Button press event listener
    submitButton.onclick = function () {
      //If no image is inputted, the year given is not a number, or the entry is flagged but no note
      //is entered, the entry is not submitted
      if (imageInput.files.length === 0) {
        alert("Every data point must include a picture")
      }
      else if (isNaN(yearInput.value)) {
        alert("Year Collected must be a number")
      }
      else if (flagBox.checked && noteInput.value === '') {
        alert("A flagged entry requires a note")
      }
      else {
        //Display the loading popup
        loadingPopup()
        //Create a new for for image upload
        const formData = new FormData()
        formData.append('myFile', imageInput.files[0])
        //Calls the '/uploadLocal' method
        fetch("/uploadLocal", {
          method: "POST",
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            //Consolidates all necessary information to upload a local image file to Google Drive
            const imgUpload = {
              imgName: yearInput.value + pointInfo.address,
              parents: "",
              imgsrc: data.path
            }
            //Calls the '/upload' method
            fetch("/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(imgUpload)
            })
              .then(function (response) {
                return response.json()
              })
              .then(function (response) {
                //All information necessary to add a new entry for an existing location to the database
                const addedJSON = {
                  _id: pointInfo._id,
                  parent_id: pointInfo.parent_id,
                  address: pointInfo.address,
                  address_street: pointInfo.address_street,
                  info: information,
                  name: nameInput.value,
                  note: noteInput.value,
                  flagged: flagBox.checked,
                  image: response.data.webContentLink,
                  year: parseInt(yearInput.value, 10),
                  store: storeInput.value,
                  group: "Undefined",
                  nace: "Undefined"
                }
                //Calls the '/add' method
                fetch("/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(addedJSON)
                })
                  .then(function (response) {
                    //Saves identifiying information about the current location to allow it to be
                    //displayed again once the entry is submitted and the dataset is regrabbed
                    const savedId = pointInfo._id
                    //Removes all features from the map
                    map.removeLayer(layer)
                    //Calls the '/load' method
                    fetch("/load", {
                      method: "GET"
                    })
                      .then(function (response) {
                        return response.json()
                      })
                      .then(function (json) {
                        //Clears the shops databases
                        dataFiltered = []
                        dataWithDeleted = []
                        //Iterates over every location grabbed from MongoDB
                        for (let i = 0; i < json.length; i++) {
                          //Grabs all entries from the location that have not been marked for deletion
                          const newInfo = []
                          for (let j = 0; j < json[i].info.length; j++) {
                            if (!json[i].info[j].deleted) { newInfo.push(json[i].info[j]) }
                          }
                          //Adds the data to the shops databases
                          if (newInfo.length > 0) {
                            //Adds the location with its non-deleted entries to dataFiltered
                            const newInsert = json[i]
                            newInsert.info = newInfo
                            //Creates a duplicate of the 'info' object for filtering purposes
                            newInsert.info2 = newInfo
                            dataFiltered.push(newInsert)
                            //Adds the location with its deleted and non-deleted entries to dataWithDeleted
                            const newInsertPlusDeleted = json[i]
                            dataWithDeleted.push(newInsertPlusDeleted)
                          }
                        }
                        //Copies dataFiltered to dataUnfiltered
                        dataUnfiltered = JSON.parse(JSON.stringify(dataFiltered))
                        return 0
                      })
                      .then(function (data) {
                        //Calls all necessary functions to reset the map and filters with 
                        //the newly grabbed data
                        setBaselines()
                        setFeatures()
                        addLayer()
                        setYearFilter()
                        filterFeatures()
                        return 0
                      })
                      .then(function () {
                        //Iterates over all features
                        for (let i = 0; i < newfeatures.length; i++) {
                          //Checks if the id of the feature matches the saved id
                          if (newfeatures[i].A._id === savedId) {
                            //Repopulates the detail popup with the newly added entry
                            popupIndex = newfeatures[i].A.info.length - 1
                            setContent(newfeatures[i].A)
                            break;
                          }
                        }
                        return 0
                      })
                  })
                return 0
              })
          })
      }
    }
    content.appendChild(submitButton)
  }

  //Creates a 'delete' button in the top right corner of the popup, adds the trash icon
  const deleteButton = document.createElement("button")
  deleteButton.classList.add('outerIcon')
  deleteButton.innerHTML = '<img class="icons" src="./assets/trash.png"/>'
  //Button press event listener
  deleteButton.onclick = function () {
    //Displays the loading popup
    loadingPopup()
    //Gathers all necessary information to delete an entry
    const addedJSON = {
      _id: pointInfo._id,
      info: informationPlusDeleted,
      year: pointInfo.info[popupIndex].year_collected
    }
    //Calls the '/delete' method
    fetch("/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addedJSON)
    })
      .then(function () {
        const deleting = new Promise((request, response) => {
          //Removes all features from the map
          map.removeLayer(layer)
          //Calls the '/load' method
          fetch("/load", {
            method: "GET"
          })
            .then(function (response) {
              return response.json()
            })
            .then(function (json) {
              //Clears the shops databases
              dataFiltered = []
              dataWithDeleted = []
              //Iterates over every location grabbed from MongoDB
              for (let i = 0; i < json.length; i++) {
                //Grabs all entries from the location that have not been marked for deletion
                const newInfo = []
                for (let j = 0; j < json[i].info.length; j++) {
                  if (!json[i].info[j].deleted) { newInfo.push(json[i].info[j]) }
                }
                //Adds the data to the shops databases
                if (newInfo.length > 0) {
                  //Adds the location with its non-deleted entries to dataFiltered
                  const newInsert = json[i]
                  newInsert.info = newInfo
                  //Creates a duplicate of the 'info' object for filtering purposes
                  newInsert.info2 = newInfo
                  dataFiltered.push(newInsert)
                  //Adds the location with its deleted and non-deleted entries to dataWithDeleted
                  const newInsertPlusDeleted = json[i]
                  dataWithDeleted.push(newInsertPlusDeleted)
                }
              }
              //Copies dataFiltered to dataUnfiltered
              dataUnfiltered = JSON.parse(JSON.stringify(dataFiltered))
              return 0
            })
            .then(function (data) {
              //Calls all necessary functions to reset features and filters
              setBaselines()
              setFeatures()
              addLayer()
              setYearFilter()
              removePopup()
              filterFeatures()
              return 0
            })
        })
        return 0
      })
  }

  //Creates a grid to house the buttons
  const popupGrid = document.createElement("div")
  popupGrid.classList.add("popupGrid")

  //Displays 'Flagged' in the first column of the grid if the current entry is flagged
  const col1 = document.createElement("h4")
  if (currInfo.flagged) { col1.innerText = 'Flagged' }
  //Displays the year of the entry in the last column of the grid
  const col5 = document.createElement("h2")
  col5.innerText = currInfo.year_collected

  //Assigns each element to a grid column
  col1.classList.add('popcol1')
  editButton.classList.add('popcol2')
  plusButton.classList.add('popcol3')
  deleteButton.classList.add('popcol4')
  col5.classList.add('popcol5')
  //Adds the displays and the buttons to the grid 
  popupGrid.appendChild(col1)
  popupGrid.appendChild(editButton)
  popupGrid.appendChild(plusButton)
  popupGrid.appendChild(deleteButton)
  popupGrid.appendChild(col5)

  //Adds the grid to the popup
  content.appendChild(popupGrid)

  //Creates a 'div' element to house all necessary displays
  const displayedInfo = document.createElement("div")
  //If the current entry has a name, shows the name in large print and the address below,
  //otherwise shows the address in large print
  if (currInfo.store_name !== "") {
    displayedInfo.innerHTML = '<h1>' + currInfo.store_name + '</h1>'
      + '<h3>' + currInfo.address + '</h3>'
  }
  else {
    displayedInfo.innerHTML = '<h1>' + currInfo.address + '</h1>'
  }
  //Appends image, street address, type, and note displays to the div
  displayedInfo.innerHTML = displayedInfo.innerHTML
    + '<img src="' + currInfo.image_url + '" id="oldImagePreview" width="200px" height="200px">'
    + '<h3>' + currInfo.address_street + '</h3>'
    + '<h3>' + currInfo.store_type + '</h3>'
    + '<p>' + currInfo.note + '</p>'

  //Appends the div to the popup
  content.appendChild(displayedInfo)

  //Reference to the image preview from the detail popup
  const oldImagePreview = document.querySelector('#oldImagePreview')
  //Image click event listener, opens image in new tab
  oldImagePreview.onclick = function () {
    if (currInfo.image_url.length > 0) {
      window.open(currInfo.image_url.substring(0, currInfo.image_url.length - 16), '_blank');
    }
  }

  //Creates button to display previous entry
  const pastButton = document.createElement("button");
  pastButton.innerText = "Previous Entry";
  pastButton.classList.add("leftButton")
  pastButton.classList.add('textButton');
  //Button press event listener
  pastButton.onclick = function () {
    //Subtracts 1 from the global index and repopulates the detail popup if there is a previous entry
    if (popupIndex > 0) {
      popupIndex = popupIndex - 1
      setContent(pointInfo)
    }
  }
  //Disables the button if there is no previous entry
  if (popupIndex === 0) {
    pastButton.style.backgroundColor = "grey";
    pastButton.disabled = true
  }
  else { pastButton.style.backgroundColor = "gainsboro" }
  content.appendChild(pastButton)

  //Creates button to display next entry
  const futureButton = document.createElement("button");
  futureButton.innerText = "Next Entry";
  futureButton.classList.add("rightButton")
  futureButton.classList.add('textButton');
  //Button press event listener
  futureButton.onclick = function () {
    //Adds 1 to the global index and repopulates the detail popup if there is a next entry
    if (popupIndex < information.length - 1) {
      popupIndex = popupIndex + 1
      setContent(pointInfo)
    }
  }
  //Disables the button if there is no next entry
  if (popupIndex === information.length - 1) {
    futureButton.style.backgroundColor = "grey";
    futureButton.disabled = true
  }
  else { futureButton.style.backgroundColor = "gainsboro" }
  content.appendChild(futureButton)

  //Draws the popup to the screen
  overlay.setOffset([-200, -300])
  overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
}

//Pans and zooms the map to focus on the inputted coordinates
function goToPosition(position) {
  //Stores the latitude and longtitude specified by the arguement
  const lat = position.coords.latitude
  const lng = position.coords.longitude
  //Does nothing if the coordinates are outside of Venice, pans and zooms otherwise
  if (lng < WEST || lng > EAST || lat > NORTH || lat < SOUTH) {
    alert("Invalid Coordinates")
  }
  else {
    map.getView().setCenter(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(19)
  }
}

//Shows an error if GPS is not properly enabled
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.")
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.")
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.")
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.")
      break;
  }
}

//Sets up the GPS button's functionality
function setGoToLocation() {
  //Reference to the GPS button
  const gotoLocation = document.querySelector('#gotoLocation')
  //Button press event listener
  gotoLocation.onclick = function () {
    //Attempts to access location services, calls 'goToPosition' if successful, 'showError' otherwise
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(goToPosition, showError);
    }
    else {
      alert('Geolocation not supported')
    }
  }
}

//Sets up the Home button's functionality
function setGoHome() {
  //Reference to the Home button
  const goHome = document.querySelector('#goHome')
  //Button press event listener, resets map pan and zoom to defaults
  goHome.onclick = function () {
    map.getView().setZoom(MINZOOM)
    map.getView().setCenter(ol.proj.transform([CENTERX, CENTERY], 'EPSG:4326', 'EPSG:3857'))
  }
}

//Sets up the Download button's functionality
function setDownload() {
  //Reference to the Download button
  const downloadButton = document.querySelector('#download')
  //Button press event listener, creates CSV with filtered dataset and downloads it to disk
  downloadButton.onclick = function () {
    //Create link element to facilitate the local download
    var element = document.createElement('a');

    //String to establish columns of CSV
    let csvData = 'ID,Latitude,Longitude,Name,Number,Address,Sestiere,Year,Type,Category,Remained Next Time?,Changed?,First?,Tourist?,Mixed?,Resident?,Artisan?\n'
    //Iterates over all the locations in the filtered dataset
    for (let i = 0; i < dataFiltered.length; i++) {
      if (dataFiltered[i].info2.length !== 0) {
        //Iterates over all entries in a given location
        for (let j = 0; j < dataFiltered[i].info.length; j++) {
          const thisInfo = dataFiltered[i].info[j]
          //Appends identifying information to the CSV string corresponding to the designated columns
          csvData = csvData + dataFiltered[i].parent_id + ','
            + dataFiltered[i].lat + ','
            + dataFiltered[i].lng + ','
            + String(thisInfo.store_name).split(',').join("") + ','
            + dataFiltered[i].address_num + ','
            + String(dataFiltered[i].address_street).split(',').join("") + ','
            + dataFiltered[i].address_sestiere + ','
            + thisInfo.year_collected + ','
            + thisInfo.store_type + ','

          //Calculates the super-category of each entry by grabbing every category and
          //checking if the entry's type matches its mapping
          const keys = Object.keys(SHOPTYPES)
          for (let k = 0; k < keys.length; k++) {
            if (SHOPTYPES[keys[k]].includes(thisInfo.store_type)) {
              csvData = csvData + keys[k] + ','
              break;
            }
          }

          //Calculates whether or not the shop remained the same type or not in the next entry
          //Not all entries have a 'next entry', so these are designated with 'N/A'
          if (j === dataFiltered[i].info.length - 1) { csvData = csvData + 'N/A,' }
          else if (thisInfo.store_type === dataFiltered[i].info[j + 1].store_type && thisInfo.store_type !== 'Closed') {
            csvData = csvData + 'False,'
          }
          else { csvData = csvData + 'True,' }

          //Calculates whether or not the shop changed type since the last entry for that location
          if (j !== 0 && dataFiltered[i].info[j - 1].store_type !== thisInfo.store_type) {
            csvData = csvData + 'True,'
          }
          else { csvData = csvData + 'False,' }

          //Records if the entry is the first for its location
          if (j === 0) { csvData = csvData + 'True,' }
          else { csvData = csvData + 'False,' }

          //Checks the type against 'typesDatabase' to calculate the target market
          for (let k = 0; k < typesDatabase.length; k++) {
            if (typesDatabase[k].type === thisInfo.store_type) {
              if (typesDatabase[k].category === "Tourist") { csvData = csvData + 'True,False,False,' }
              else if (typesDatabase[k].category === "Mixed") { csvData = csvData + 'False,True,False,' }
              else { csvData = csvData + 'False,False,True,' }
            }
          }

          //Checks the type against the 'ARTISANTYPES' constant and records whether
          //or not it is an artisan type
          csvData = csvData + (ARTISANTYPES.includes(thisInfo.store_type) ? 'True' : 'False') + '\n'
        }
      }
    }

    //Prepares the link element to handle downloads, usues it to download the data, and removes it
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
    element.setAttribute('download', 'VeniceData.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

//Sets up the Settings button
function setSettings() {
  //Reference to the Settings button
  const openSettings = document.querySelector('#settings')
  //Button press event listener, opens the options popup and allows the types' 
  //market mappings to be modified
  openSettings.onclick = function () {
    //Opens the popup, clears its content
    popupPresent = true
    overlay.setOffset([-200, -300])
    overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
    content.innerHTML = ""

    //Iterates over all shop types
    for (let i = 0; i < allTypes.length; i++) {
      //Creates a 'div' element to house the label and options
      const typeDiv = document.createElement("div")
      typeDiv.classList.add('typeGrid')

      //Creates a label for the options that displays the name of the current type
      const typeLabel = document.createElement("h3")
      typeLabel.innerText = allTypes[i] + ': '
      typeLabel.style.display = 'inline-block'

      //Creates a 3-way toggle switch
      const selector = document.createElement('div')
      selector.classList.add("switch-toggle")

      //Creates an input for the 'Tourist' type
      const touristInput = document.createElement('input')
      touristInput.id = 'Tourist' + i
      touristInput.name = 'state-d' + i
      touristInput.type = 'radio'
      //Button press event listener, changes the colors of all buttons and the 
      //market of the associated type in the 'typesDatabase'
      touristInput.onclick = function () {
        if (touristInput.checked) {
          touristLabel.style.backgroundColor = 'Green'
          mixedLabel.style.backgroundColor = 'Black'
          residentLabel.style.backgroundColor = 'Black'
          typesDatabase[i].category = 'Tourist'
        }
        else { touristLabel.style.backgroundColor = 'Black' }
      }
      //Creates label that places the word 'Tourist' inside the button
      const touristLabel = document.createElement('label')
      touristLabel.for = 'Tourist' + i
      touristLabel.innerText = 'Tourist'
      if (typesDatabase[i].category === 'Tourist') {
        touristInput.checked = true
        touristLabel.style.backgroundColor = 'Green'
      }
      selector.appendChild(touristLabel)
      touristLabel.appendChild(touristInput)

      //Creates an input for the 'Mixed' type
      const mixedInput = document.createElement('input')
      mixedInput.id = 'Mixed' + i
      mixedInput.name = 'state-d' + i
      mixedInput.type = 'radio'
      //Button press event listener, changes the colors of all buttons and the 
      //market of the associated type in the 'typesDatabase'
      mixedInput.onclick = function () {
        if (mixedInput.checked) {
          touristLabel.style.backgroundColor = 'Black'
          mixedLabel.style.backgroundColor = 'Green'
          residentLabel.style.backgroundColor = 'Black'
          typesDatabase[i].category = 'Mixed'
        }
        else { mixedLabel.style.backgroundColor = 'Black' }
      }
      //Creates label that places the word 'Mixed' inside the button
      const mixedLabel = document.createElement('label')
      mixedLabel.for = 'Mixed' + i
      mixedLabel.innerText = 'Mixed'
      if (typesDatabase[i].category === 'Mixed') {
        mixedInput.checked = true
        mixedLabel.style.backgroundColor = 'Green'
      }
      selector.appendChild(mixedLabel)
      mixedLabel.appendChild(mixedInput)

      //Creates an input for the 'Resident' type
      const residentInput = document.createElement('input')
      residentInput.id = 'Resident' + i
      residentInput.name = 'state-d' + i
      residentInput.type = 'radio'
      //Button press event listener, changes the colors of all buttons and the 
      //market of the associated type in the 'typesDatabase'
      residentInput.onclick = function () {
        if (residentInput.checked) {
          touristLabel.style.backgroundColor = 'Black'
          mixedLabel.style.backgroundColor = 'Black'
          residentLabel.style.backgroundColor = 'Green'
          typesDatabase[i].category = 'Resident'
        }
        else { residentLabel.style.backgroundColor = 'Black' }
      }
      //Creates label that places the word 'Resident' inside the button
      const residentLabel = document.createElement('label')
      residentLabel.for = 'Resident' + i
      residentLabel.innerText = 'Resident'
      if (typesDatabase[i].category === 'Resident') {
        residentInput.checked = true
        residentLabel.style.backgroundColor = 'Green'
      }
      selector.appendChild(residentLabel)
      residentLabel.appendChild(residentInput)

      typeDiv.appendChild(typeLabel)
      typeDiv.appendChild(selector)
      content.appendChild(typeDiv)
    }

    content.appendChild(document.createElement("br"))
    content.appendChild(document.createElement("br"))
    content.appendChild(document.createElement("br"))
    content.appendChild(document.createElement("br"))

    //Creates Cancel button
    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("textButton")
    cancelButton.classList.add("leftButton")
    //Button press event listener, removes the popup, which resets 'typesDatabse'
    cancelButton.onclick = function () { removePopup() }
    content.appendChild(cancelButton)

    //Creates Submit button
    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("textButton")
    submitButton.classList.add("rightButton")
    //Button press event listener, pushes changes to MongoDB and updates the local databases
    submitButton.onclick = function () {
      //Calls the '/setTypes' method
      fetch("/setTypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 'data': typesDatabase })
      })
        .then(function (response) {
          return response.json()
        })
        .then(function (json) {
          //Updates the default value of 'typesDatabse'
          //'typesDatabase' itself is updated when 'removePopup' is called
          typesDatabaseDefault = json
          return 0
        })
        .then(removePopup())
    }
    content.appendChild(submitButton)
  }
}

//Sets up the Add Location button
function setAddLocation() {
  //Reference to the Add Location button
  const addLocation = document.querySelector('#addLocation')
  //Button press event listener, allows users to create a new location and its first entry
  addLocation.onclick = function () {
    //Shows the popup and clears its content
    popupPresent = true
    overlay.setOffset([-200, -300])
    overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
    content.innerHTML = ""

    //Creates a dropdown for selecting the sestiere
    const sestiereLabel = document.createElement("label")
    sestiereLabel.setAttribute("for", "sestiereInput")
    sestiereLabel.innerText = "Sestiere: "
    content.appendChild(sestiereLabel)
    const sestiereInput = document.createElement("select")
    sestiereInput.setAttribute("id", "sestiereInput")
    sestiereInput.setAttribute("name", "sestiereInput")
    for (let i = 0; i < sestiereOptionsCopy.length; i++) {
      sestiereInput.add(sestiereOptionsCopy[i])
    }
    content.appendChild(sestiereInput)
    content.appendChild(document.createElement("br"))

    //Creates a grid to standardize the format of the subsequent inputs
    const inputGrid1 = document.createElement("div")
    inputGrid1.classList.add('inputGrid2')

    //Creates an input for the street name
    const streetLabel = document.createElement("label")
    streetLabel.setAttribute("for", "streetInput")
    streetLabel.innerText = "Street: "
    inputGrid1.appendChild(streetLabel)
    const streetInput = document.createElement("input")
    streetInput.setAttribute("id", "streetInput")
    streetInput.setAttribute("name", "streetInput")
    inputGrid1.appendChild(streetInput)
    const clearStreet = document.createElement("button")
    clearStreet.innerText = "Clear"
    clearStreet.onclick = function () { streetInput.value = "" }
    inputGrid1.appendChild(clearStreet)

    //Creates an input for the address number
    const numberLabel = document.createElement("label")
    numberLabel.setAttribute("for", "numberInput")
    numberLabel.innerText = "Number: "
    inputGrid1.appendChild(numberLabel)
    const numberInput = document.createElement("input")
    numberInput.setAttribute("id", "numberInput")
    numberInput.setAttribute("name", "numberInput")
    inputGrid1.appendChild(numberInput)
    const clearNumber = document.createElement("button")
    clearNumber.innerText = "Clear"
    clearNumber.onclick = function () { numberInput.value = "" }
    inputGrid1.appendChild(clearNumber)

    //Creates an input for the latitude
    const latLabel = document.createElement("label")
    latLabel.setAttribute("for", "latInput")
    latLabel.innerText = "Latitude: "
    inputGrid1.appendChild(latLabel)
    const latInput = document.createElement("input")
    latInput.setAttribute("id", "latInput")
    latInput.setAttribute("name", "latInput")
    inputGrid1.appendChild(latInput)
    const clearLat = document.createElement("button")
    clearLat.innerText = "Clear"
    clearLat.onclick = function () { latInput.value = "" }
    inputGrid1.appendChild(clearLat)

    //Creates an input for the longitude
    const lngLabel = document.createElement("label")
    lngLabel.setAttribute("for", "lngInput")
    lngLabel.innerText = "Longitude: "
    inputGrid1.appendChild(lngLabel)
    const lngInput = document.createElement("input")
    lngInput.setAttribute("id", "lngInput")
    lngInput.setAttribute("name", "lngInput")
    inputGrid1.appendChild(lngInput)
    const clearLng = document.createElement("button")
    clearLng.innerText = "Clear"
    clearLng.onclick = function () { lngInput.value = "" }
    inputGrid1.appendChild(clearLng)
    content.appendChild(inputGrid1)

    //Creates the Find Coordinates button
    const findCoords = document.createElement("button")
    findCoords.innerText = "Find Coordinates"
    findCoords.classList.add("textButton")
    findCoords.style.width = "150px"
    //Button press event listener, allows user to click a location on the map and
    //sets the latitude and longitude inputs accordingly
    findCoords.onclick = function () {
      //Removes the popup
      removePopup()

      //Alert to teach the user how to use the functionality
      alert("Click a location to set the coordinates of the new store")

      //Changes the 'click' event listener of the map, now it sets the latitude and 
      //longitude inputs to match the clicked location and then resets the listener
      map.on('singleclick', function (event) {
        popupPresent = true
        //Transforms the location of the click into a latitude and longitude
        const coords = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
        //Sets the latitude and longitude inputs accordingly
        latInput.value = coords[1]
        lngInput.value = coords[0]
        //Shows the popup
        overlay.setOffset([-200, -300])
        overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))

        //Resets the map 'click' event listener (now opens a detail popup if a shop is clicked)
        map.on('singleclick', function (event) {
          if (map.hasFeatureAtPixel(event.pixel) && map.getFeaturesAtPixel(event.pixel)[0].A.type === 'shop') {
            popupPresent = true
            abbrPopup.innerText = ''
            let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
            popupIndex = pointInfo.info.length - 1
            setContent(pointInfo)
          } else { removePopup() }
        });
      })
    }
    content.appendChild(findCoords)
    content.appendChild(document.createElement("br"))

    //Creates image preview to show the inputted image
    const imagePreview = document.createElement("img")
    imagePreview.setAttribute("class", "imagePreview")
    content.appendChild(imagePreview)
    const imageInput = document.createElement("input")
    imageInput.setAttribute("type", "file")
    imageInput.setAttribute("accept", "image/png, image/jpeg")
    imageInput.setAttribute("id", "imageInput")
    imageInput.onchange = function () {
      imagePreview.setAttribute("src", URL.createObjectURL(imageInput.files[0]))
    }
    content.appendChild(imageInput)
    content.appendChild(document.createElement("br"))

    //Creates a second grid to standardize the format of the subsequent inputs
    const inputGrid2 = document.createElement("div")
    inputGrid2.classList.add('inputGrid2')

    //Creates a name input 
    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Name:"
    inputGrid2.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    inputGrid2.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function () { nameInput.value = "" }
    inputGrid2.appendChild(clearName)

    //Creates a year input
    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year:"
    inputGrid2.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    //Defaults to the year in which the data is being entered
    yearInput.value = new Date().getFullYear()
    inputGrid2.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    inputGrid2.appendChild(clearYear)

    //Creates a store type dropdown
    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Type:"
    inputGrid2.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    for (let i = 0; i < storesOptionsCopy.length; i++) {
      storeInput.add(storesOptionsCopy[i])
    }
    inputGrid2.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function () { storeInput.value = "Closed" }
    inputGrid2.appendChild(clearStore)

    //Creates a not input
    const noteLabel = document.createElement("label")
    noteLabel.setAttribute("for", "noteInput")
    noteLabel.innerText = "Note:"
    inputGrid2.appendChild(noteLabel)
    const noteInput = document.createElement("input")
    noteInput.setAttribute("id", "noteInput")
    noteInput.setAttribute("name", "noteInput")
    inputGrid2.appendChild(noteInput)
    const clearNote = document.createElement("button")
    clearNote.innerText = "Clear"
    clearNote.onclick = function () { noteInput.value = "" }
    inputGrid2.appendChild(clearNote)
    content.appendChild(inputGrid2)

    //Creates a checkbox for flagging 
    const flagLabel = document.createElement("label")
    flagLabel.setAttribute("for", "flagbox")
    flagLabel.innerText = "Flagged"
    content.appendChild(flagLabel)
    const flagBox = document.createElement("input")
    flagBox.setAttribute("type", "checkbox")
    flagBox.setAttribute("id", "flagbox")
    flagBox.setAttribute("name", "flagBox")
    content.appendChild(flagBox)
    content.appendChild(document.createElement("br"))

    //Creates a cancel button
    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("textButton")
    cancelButton.classList.add("leftButton")
    //Button press event listener, removes the popup without submitting the new location
    cancelButton.onclick = function () { removePopup() }
    content.appendChild(cancelButton)

    //Creates a submit button
    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("textButton")
    submitButton.classList.add("rightButton")
    //Button press event listener, submits the new location to the database and regrabs the data
    submitButton.onclick = function () {
      //Does not submit location if the address number is left blank, the latitude and longitude
      //are not numbers, there is no image, the year is not a number, or the entry is flagged but
      //no note is given
      if (numberInput.value === "") {
        alert("Address Number cannot be left blank")
      }
      else if (isNaN(latInput.value)) {
        alert("Latitude must be a number")
      }
      else if (isNaN(lngInput.value)) {
        alert("Longitude must be a number")
      }
      else if (imageInput.files.length === 0) {
        alert("Every data point must include a picture")
      }
      else if (isNaN(yearInput.value)) {
        alert("Year Collected must be a number")
      }
      else if (flagBox.checked && noteInput.value === '') {
        alert("A flagged entry requires a note")
      }
      else {
        //Shows the loading message
        loadingPopup()
        //Creates a form to faciliate temporary local image storage
        const formData = new FormData()
        formData.append('myFile', imageInput.files[0])
        //Calls the '/uploadLocal' method
        fetch("/uploadLocal", {
          method: "POST",
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            //Stores information necessary to upload image to Google Drive
            const imgUpload = {
              imgName: yearInput.value + sestiereInput.value + ' ' + numberInput.value,
              parents: "",
              imgsrc: data.path
            }
            //Calls the '/upload' method
            fetch("/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(imgUpload)
            })
              .then(function (response) {
                return response.json()
              })
              .then(function (response) {
                //All necessary information for a location and an entry
                const addedJSON = {
                  parent_id: dataUnfiltered.length + 1,
                  street: streetInput.value,
                  sestiere: sestiereInput.value,
                  number: numberInput.value,
                  lat: parseFloat(latInput.value),
                  lng: parseFloat(lngInput.value),
                  name: nameInput.value,
                  note: noteInput.value,
                  flagged: flagBox.checked,
                  image: response.data.webContentLink,
                  year: parseInt(yearInput.value, 10),
                  store: storeInput.value,
                  group: "Undefined",
                  nace: "Undefined"
                }
                //Calls the '/addLoc' method
                fetch("/addLoc", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(addedJSON)
                })
                  .then(function () {
                    const editing = new Promise((request, response) => {
                      //Removes all features from the map
                      map.removeLayer(layer)
                      fetch("/load", {
                        method: "GET"
                      })
                        .then(function (response) {
                          return response.json()
                        })
                        .then(function (json) {
                          //Clears the shops databases
                          dataFiltered = []
                          dataWithDeleted = []
                          //Iterates over every location grabbed from MongoDB
                          for (let i = 0; i < json.length; i++) {
                            //Grabs all entries from the location that have not been marked for deletion
                            const newInfo = []
                            for (let j = 0; j < json[i].info.length; j++) {
                              if (!json[i].info[j].deleted) { newInfo.push(json[i].info[j]) }
                            }
                            //Adds the data to the shops databases
                            if (newInfo.length > 0) {
                              //Adds the location with its non-deleted entries to dataFiltered
                              const newInsert = json[i]
                              newInsert.info = newInfo
                              //Creates a duplicate of the 'info' object for filtering purposes
                              newInsert.info2 = newInfo
                              dataFiltered.push(newInsert)
                              //Adds the location with its deleted and non-deleted entries to dataWithDeleted
                              const newInsertPlusDeleted = json[i]
                              dataWithDeleted.push(newInsertPlusDeleted)
                            }
                          }
                          //Copies dataFiltered to dataUnfiltered
                          dataUnfiltered = JSON.parse(JSON.stringify(dataFiltered))
                          return 0
                        })
                        .then(function (data) {
                          //Calls all function necessary to reset the map and the filters
                          setBaselines()
                          setFeatures()
                          addLayer()
                          setYearFilter()
                          filterFeatures()
                          return 0
                        })
                        .then(function () {
                          //Displays the detail popup for the new location and entry
                          popupIndex = 0
                          setContent(newfeatures[newfeatures.length - 1].A)
                          return 0
                        })
                    })
                    return 0
                  })
              })
          })
      }
    }
    content.appendChild(submitButton)
  }
}

//Facilitates the creation of checkbox filters
function setCheckboxHTML(name) {
  return '<input class="checkbox" type="checkbox" id="' + name + 'box">'
    + '<label for="' + name + 'box">' + name + '</label>'
}

//Creates the checkbox filters
function setCheckboxes() {
  //Creates the filter for flagged entries
  const flagFilter = document.querySelector('#flagFilter')
  flagFilter.innerHTML = setCheckboxHTML('Flagged')
  const flaggedBox = document.querySelector('#Flaggedbox')
  flaggedBox.addEventListener("change", filterFeatures)

  //Creates the filter for unflagged entries
  const unflagFilter = document.querySelector('#unflagFilter')
  unflagFilter.innerHTML = setCheckboxHTML('Unflagged')
  const unflaggedBox = document.querySelector('#Unflaggedbox')
  unflaggedBox.addEventListener("change", filterFeatures)

  //Creates the filter for entries that are not currently closed
  const openFilter = document.querySelector('#openFilter')
  openFilter.innerHTML = setCheckboxHTML('Open')
  const openBox = document.querySelector('#Openbox')
  openBox.addEventListener("change", filterFeatures)

  //Creates the filter for entries that fall into the 'Tourist' category
  const touristFilter = document.querySelector('#touristFilter')
  touristFilter.innerHTML = setCheckboxHTML('Tourist')
  const touristBox = document.querySelector('#Touristbox')
  touristBox.addEventListener("change", filterFeatures)

  //Creates the filter for entries that fall into the 'Resident' category
  const residentFilter = document.querySelector('#residentFilter')
  residentFilter.innerHTML = setCheckboxHTML('Resident')
  const residentBox = document.querySelector('#Residentbox')
  residentBox.addEventListener("change", filterFeatures)

  //Creates the filter for entries that fall into the 'Mixed' category
  const mixedFilter = document.querySelector('#mixedFilter')
  mixedFilter.innerHTML = setCheckboxHTML('Mixed')
  const mixedBox = document.querySelector('#Mixedbox')
  mixedBox.addEventListener("change", filterFeatures)

  //Creates the filter for features that are of type 'shop'
  const shopsFilter = document.querySelector('#shopsFilter')
  shopsFilter.innerHTML = setCheckboxHTML('Shops')
  const shopsBox = document.querySelector('#Shopsbox')
  shopsBox.checked = true
  shopsBox.addEventListener("change", filterFeatures)

  //Creates the filter for features that are of type 'airbnb'
  const airbnbFilter = document.querySelector('#airbnbFilter')
  airbnbFilter.innerHTML = setCheckboxHTML('Airbnbs')
  const airbnbsbox = document.querySelector('#Airbnbsbox')
  airbnbsbox.addEventListener("change", filterFeatures)
}

//Sets up the Year filter
function setYearFilter() {
  //Year filter reference
  const yearFilter = document.querySelector('#yearFilter')
  yearFilter.innerHTML = yearFilterDefault

  //Creates the dropdown
  const yearSelect = document.createElement('select')
  yearSelect.multiple = true
  yearSelect.id = 'yearSelect'
  yearSelect.onchange = function () {
    //Stops the timelapse if necessary
    if (timelapsing) { stopTimelapse() }
    //Filters the data to reflect the selected years
    filterFeatures()
  }
  //Appends all pre-calculated 'Year' options to the selector
  for (var i = 0; i < yearOptions.length; i++) {
    yearSelect.appendChild(yearOptions[i]);
  }

  //Appends the dropdown to the filter
  yearFilter.appendChild(yearSelect)

  //Establishes the dropdown as a 'SlimSelect' selector, which allows for
  //aesthetically pleasing and functional multi-select dropdowns
  const yearSlimSelect = new SlimSelect({
    select: '#yearSelect',
    allowDeselectOption: true,
    allowDeselect: true,
    closeOnSelect: true,
    placeholder: "Add Filters"
  });
}

//Sets up the Sestiere filter
function setSestiereFilter() {
  //Reference to the Sestiere filter
  const sestiereFilter = document.querySelector('#sestiereFilter')
  sestiereFilter.innerHTML = sestiereFilterDefault

  //Creates the dropdown
  const sestiereSelect = document.createElement('select')
  sestiereSelect.multiple = true
  sestiereSelect.id = 'sestiereSelect'
  sestiereSelect.onchange = function () { filterFeatures }

  //Appends all pre-calculated 'Sestiere' options to the selector
  for (var i = 0; i < sestiereOptions.length; i++) {
    sestiereSelect.appendChild(sestiereOptions[i]);
  }

  //Appends the dropdown to the filter
  sestiereFilter.appendChild(sestiereSelect)

  //Establishes the dropdown as a 'SlimSelect' selector
  const sestiereSlimSelect = new SlimSelect({
    select: '#sestiereSelect',
    allowDeselectOption: true,
    allowDeselect: true,
    closeOnSelect: true,
    placeholder: "Add Filters"
  });
}

//Sets up the Shop Type filter
function setStoreFilter() {
  //Reference to the Shop Type filter
  const storeFilter = document.querySelector('#storeFilter')
  storeFilter.innerHTML = storeFilterDefault

  //Creates the dropdown
  const storeSelect = document.createElement('select')
  storeSelect.multiple = true
  storeSelect.id = 'storeSelect'
  storeSelect.onchange = function () { filterFeatures }

  //Appends all pre-calculated 'Shop type' options to the selector
  for (var i = 0; i < storesOptions.length; i++) {
    storeSelect.appendChild(storesOptions[i]);
  }

  //Appends the dropdown to the filter
  storeFilter.appendChild(storeSelect)

  //Establishes the dropdown as a 'SlimSelect' selector
  const storeSlimSelect = new SlimSelect({
    select: '#storeSelect',
    selectByGroup: true,
    allowDeselectOption: true,
    allowDeselect: true,
    closeOnSelect: true,
    placeholder: "Add Filters"
  });
}

//Sets up the Timelapse buttons
function setTimelapse() {
  //Reference to the Start Cycle button
  const timelapseButton = document.querySelector('#timelapseButton')
  //Button press event listener, calls 'StartTimelapse'
  timelapseButton.onclick = function () { startTimelapse }
  timelapseButton.style.backgroundColor = "gainsboro"

  //Reference to the Stop Cycle button
  const stopTimelapseButton = document.querySelector('#stopTimelapseButton')
  //Button press event listener, calls 'StopTimelapse'
  stopTimelapseButton.onclick = function () { stopTimelapse }
  stopTimelapseButton.style.backgroundColor = "grey"
  //Disables the button by default
  stopTimelapseButton.disabled = true
}

//Starts the timelapse
function startTimelapse() {
  //Reference to the Start Cycle button
  const timelapseButton = document.querySelector('#timelapseButton')
  //If the timelapse is paused, resume the timelapse, otherwise pause it
  if (paused) {
    paused = false
    //Changes the text of the button
    timelapseButton.innerText = 'Resume Cycle'
    //Pauses the cycling
    clearInterval(timelapseInterval)
  }
  else {
    //Sets the 'timelapsing' global flag to true to facilitate correct filtering
    timelapsing = true
    paused = true
    //Changes the text of the button
    timelapseButton.innerText = 'Pause Cycle'
    //Refernce to the year display
    const yearDisplay = document.querySelector('#yearDisplay')

    //References and enables the Stop Timelapse button
    const stopTimelapseButton = document.querySelector('#stopTimelapseButton')
    stopTimelapseButton.style.backgroundColor = "gainsboro"
    stopTimelapseButton.disabled = false

    //Refernce to the year filter
    const yearSelecting = document.querySelector('#yearSelect')
    let allYearTargets = []
    //Grabs all selected years, grabs all years if none are selected
    for (let i = yearSelecting.selectedOptions.length - 1; i >= 0; i--) {
      allYearTargets.push(yearSelecting.selectedOptions[i].value)
    }
    if (allYearTargets.length === 0) {
      allYearTargets = [...allYears].sort()
    }

    //Passes only one of the selected years to the filtering function
    yearTargets = allYearTargets[yearIndex]
    filterFeatures()
    //Displays the name of the shown year under the cycling buttons
    yearDisplay.innerText = allYearTargets[yearIndex]
    //Increases the global index of the year counter
    yearIndex = yearIndex + 1
    if (yearIndex === allYearTargets.length) { yearIndex = 0 }

    //Changes the selected year and refilters the dataset on an interval 
    //determined by the 'CYCLETIME' constant
    timelapseInterval = setInterval(function () {
      yearTargets = allYearTargets[yearIndex]
      filterFeatures()
      yearDisplay.innerText = allYearTargets[yearIndex]
      yearIndex = yearIndex + 1
      if (yearIndex === allYearTargets.length) { yearIndex = 0 }
    }, CYCLETIME)
  }
}

//Stops the timelapse
function stopTimelapse() {
  //Resets the timelapse index and relevant flags
  yearIndex = 0
  timelapsing = false
  paused = false
  //Stops timelapsing
  clearInterval(timelapseInterval)
  //References the Start Cycle button and resets its label
  const timelapseButton = document.querySelector('#timelapseButton')
  timelapseButton.innerText = 'Cycle Years'
  timelapseButton.onclick = startTimelapse

  //References and clears the year display
  const yearDisplay = document.querySelector('#yearDisplay')
  yearDisplay.innerText = ''

  //References and disables the Stop Timelapse button
  const stopTimelapseButton = document.querySelector('#stopTimelapseButton')
  stopTimelapseButton.style.backgroundColor = "grey"
  stopTimelapseButton.disabled = true

  //Refilters the data to undo the effect of the timelapse
  filterFeatures()
}

//Sets up the Change Size button
function setChangeSize() {
  //References to the change size button and its image
  const changeSizeButton = document.querySelector('#changeSize')
  const changeSizeIcon = document.querySelector('#changeSizeImg')
  //Button press event listener
  changeSizeButton.onclick = function () {
    //If the circles are small, increase their size and change the image to the 'reduce' png,
    //otherwise, decrease their size and change the image to the 'enlarge' png
    if (radius === 5) {
      changeSizeIcon.src = "./assets/reduce.png"
      radius = 15
    }
    else {
      changeSizeIcon.src = "./assets/enlarge.png"
      radius = 5
    }
    //Recalculates the styles to reflect the new radius
    setStyles()
    //Reestablishes the features to reflect the new styles
    setFeatures()
    //Filters the features to reset the circles and adhere to any selected filters
    filterFeatures()
  }
}

//Determines whether or not an entry's type fits within a set of markets
function marketFilter(shopType, targetCategories) {
  for (let k = 0; k < typesDatabase.length; k++) {
    if (typesDatabase[k].type === shopType) {
      if (targetCategories.includes(typesDatabase[k].category)) { return true }
      else { return false }
    }
  }
  return false
}

//Filters the data based on the dropdown and checkbox filters
function filterFeatures() {
  //Removes the popup if necessary
  removePopup()
  //Resets the filtered databases
  dataFiltered = JSON.parse(JSON.stringify(dataUnfiltered))
  airbnbFiltered = JSON.parse(JSON.stringify(airbnbUnfiltered))

  //If the app is not currently in timelapse mode, grab all selected years, otherwise
  //only use the preestablished year for filtering
  if (!timelapsing) {
    //References the Year filter
    const yearSelecting = document.querySelector('#yearSelect')
    yearTargets = []
    //Grabs all selected options from the filter
    for (let i = 0; i < yearSelecting.selectedOptions.length; i++) {
      yearTargets.push(yearSelecting.selectedOptions[i].value)
    }
  }

  //Refereces for the checkboxes
  let addShops = document.querySelector('#Shopsbox')
  let addAirbnbs = document.querySelector('#Airbnbsbox')
  let sestiereSelecting = document.querySelector('#sestiereSelect')
  let storeSelecting = document.querySelector('#storeSelect')
  let flagged = document.querySelector('#Flaggedbox')
  let unflagged = document.querySelector('#Unflaggedbox')
  let openOnly = document.querySelector('#Openbox')
  let touristOnly = document.querySelector('#Touristbox')
  let residentOnly = document.querySelector('#Residentbox')
  let mixedOnly = document.querySelector('#Mixedbox')

  //Disables all checkboxes and clears all shops data if unchecked
  if (!addShops.checked) {
    flagged.disabled = true
    unflagged.disabled = true
    openOnly.disabled = true
    touristOnly.disabled = true
    residentOnly.disabled = true
    mixedOnly.disabled = true
    for (let i = 0; i < dataFiltered.length; i++) {
      dataFiltered[i].info2 = []
    }
  }
  else {
    flagged.disabled = false
    unflagged.disabled = false
    openOnly.disabled = false
    touristOnly.disabled = false
    residentOnly.disabled = false
    mixedOnly.disabled = false
  }

  //Clears all airbnb data if unchecked
  if (!addAirbnbs.checked) {
    for (let i = 0; i < airbnbFiltered.length; i++) {
      airbnbFiltered[i].years = []
    }
  }

  sestiereTargets = []
  //Grabs all selected sestiere from the filter
  for (let i = 0; i < sestiereSelecting.selectedOptions.length; i++) {
    sestiereTargets.push(sestiereSelecting.selectedOptions[i].value)
  }

  storeTargets = []
  //Grabs all selected types from the filter
  for (let i = 0; i < storeSelecting.selectedOptions.length; i++) {
    storeTargets.push(storeSelecting.selectedOptions[i].value)
  }

  //If the Flagged box is checked, disable the Unflagged checkbox
  if (flagged.checked) {
    unflagged.disabled = true
    //Iterates over all locations in 'dataFiltered'
    for (let i = 0; i < dataFiltered.length; i++) {
      //Remove all entries from the location's 'info2' array that are not flagged
      dataFiltered[i].info2 = dataFiltered[i].info2.filter(item => item.flagged)
    }
  }
  else { unflagged.disabled = false }
  //If the Unflagged box is checked, disable the Flagged checkbox
  if (unflagged.checked) {
    flagged.disabled = true
    //Iterates over all locations in 'dataFiltered'
    for (let i = 0; i < dataFiltered.length; i++) {
      //Remove all entries from the location's 'info2' array that are flagged
      dataFiltered[i].info2 = dataFiltered[i].info2.filter(item => !item.flagged)
    }
  }
  else { flagged.disabled = false }

  //Checks if the Open box is checked
  if (openOnly.checked) {
    //Iterates over all locations in 'dataFiltered'
    for (let i = 0; i < dataFiltered.length; i++) {
      //Removes all entries from the info2 array of the location if the most recent entry
      //for that location was of type 'closed'
      if (dataFiltered[i].info2.length !== 0 && dataFiltered[i].info2[dataFiltered[i].info2.length - 1].store_type === 'Closed') {
        dataFiltered[i].info2 = []
      }
    }
  }

  //Stores whether or not each box is selected
  //If no box is selected, all market are shown
  let markets = []
  if (touristOnly.checked) { markets.push("Tourist") }
  if (residentOnly.checked) { markets.push("Resident") }
  if (mixedOnly.checked) { markets.push("Mixed") }
  if (markets.length === 0) { markets = ["Tourist", "Resident", "Mixed"] }
  //Iterates over all locations in 'dataFiltered'
  for (let i = 0; i < dataFiltered.length; i++) {
    //Every entry that does not match the markets is removed from a location's 'info2' array
    dataFiltered[i].info2 = dataFiltered[i].info2.filter(item => marketFilter(item.store_type, markets))
  }

  //Only filters by year if at least one year is selected
  if (yearTargets.length !== 0) {
    //Removes all shops from years that are not selected
    for (let i = 0; i < dataFiltered.length; i++) {
      dataFiltered[i].info2 = dataFiltered[i].info2.filter(item => yearTargets.includes(String(item.year_collected)))
    }
    //Removes all airbnbs from years that are not selected
    for (let i = 0; i < airbnbFiltered.length; i++) {
      airbnbFiltered[i].years = airbnbFiltered[i].years.filter(item => yearTargets.includes(String(item)) || yearTargets.includes(String(item) + ' (Airbnb only)'))
    }
  }
  //Only filters by sestiere if at least one sestiere is selected
  if (sestiereTargets.length !== 0) {
    //Removes all shops from sestiere that are not selected
    for (let i = 0; i < dataFiltered.length; i++) {
      if (!sestiereTargets.includes(dataFiltered[i].address_sestiere)) {
        dataFiltered[i].info2 = []
      }
    }
    //Removes all airbnbs from sestiere that are not selected
    for (let i = 0; i < airbnbFiltered.length; i++) {
      if (!sestiereTargets.includes(airbnbFiltered[i].address_sestiere)) {
        airbnbFiltered[i].years = []
      }
    }
  }
  //Only filters by type if at least one type is selected
  if (storeTargets.length !== 0) {
    //Removes all shops with types that are not selected
    for (let i = 0; i < dataFiltered.length; i++) {
      dataFiltered[i].info2 = dataFiltered[i].info2.filter(item => storeTargets.includes(item.store_type))
    }
  }

  //Removes all features from the map
  map.removeLayer(layer)

  //Recreates the features with the new filtered datasets
  setFeatures()
  //Adds the features to the map
  addLayer()
}

//Function called when the app loads, calls all setup functions
window.onload = function () {
  //Add the map to the screen before data is grabbed
  setMap()
  const init = new Promise((request, response) => {
    //Removes all features from the map
    map.removeLayer(layer)
    //Calls the '/load' method
    fetch("/load", {
      method: "GET"
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        //Clears the shops databases
        dataFiltered = []
        dataWithDeleted = []
        //Iterates over every location grabbed from MongoDB
        for (let i = 0; i < json.length; i++) {
          //Grabs all entries from the location that have not been marked for deletion
          const newInfo = []
          for (let j = 0; j < json[i].info.length; j++) {
            if (!json[i].info[j].deleted) { newInfo.push(json[i].info[j]) }
          }
          //Adds the data to the shops databases
          if (newInfo.length > 0) {
            //Adds the location with its non-deleted entries to dataFiltered
            const newInsert = json[i]
            newInsert.info = newInfo
            //Creates a duplicate of the 'info' object for filtering purposes
            newInsert.info2 = newInfo
            dataFiltered.push(newInsert)
            //Adds the location with its deleted and non-deleted entries to dataWithDeleted
            const newInsertPlusDeleted = json[i]
            dataWithDeleted.push(newInsertPlusDeleted)
          }
        }
        //Copies dataFiltered to dataUnfiltered
        dataUnfiltered = JSON.parse(JSON.stringify(dataFiltered))
        return 0
      })
      .then(function (data) {
        //Calls the '/loadAirbnb' method
        fetch("/loadAirbnb", {
          method: "GET"
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (json) {
            //Stores the airbnb data
            airbnbFiltered = json
            airbnbUnfiltered = JSON.parse(JSON.stringify(airbnbFiltered))
            return 0
          })
          .then(function (data) {
            //Calls the '/loadTypes' method
            fetch("/loadTypes", {
              method: "GET"
            })
              .then(function (response) {
                return response.json()
              })
              .then(function (json) {
                //Stores the type mapping data
                typesDatabase = json
                typesDatabaseDefault = JSON.parse(JSON.stringify(typesDatabase))
                return 0
              })
              .then(function (data) {
                //Calls all necessary setup functions
                setBaselines()
                setFeatures()
                removePopup()
                setPopup()
                setStyles()
                addLayer()
                setGoToLocation()
                setGoHome()
                setDownload()
                setSettings()
                setAddLocation()
                setCheckboxes()
                setYearFilter()
                setSestiereFilter()
                setStoreFilter()
                setTimelapse()
                setChangeSize()
                filterFeatures()
                return 0
              })
          })
      })
  })
}