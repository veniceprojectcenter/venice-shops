let data
let dataAll
let airbnbData
let airbnbDataAll

let centerX = 12.34
let centerY = 45.436

let mapX
let mapY

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var overlay;
var popupIndex

let newfeatures = []

let map
let layer

let abbvPopup = document.querySelector('#abbvPopup')
const abbvs = {
  "Cannaregio": "CN", "Castello": "CS", "San Marco": "SM", "Dorsoduro": "DD",
  "San Polo": "SP", "Santa Croce": "SC", "Giudecca": "GD"
}

const shopTypes = {
  'Clothing Stores': ['Clothing', 'Costumes', "Children's Clothing", 'Gloves', 'Mask', "Men's Clothing", 'Shoes',
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
    'Light Store', 'Luxury', 'Metal Work', 'Music', 'Musical Instruments', 'Newspaper', 'Office Supplies',
    'Pawn Shop', 'Pet Store', 'Picture Frames', 'Souvenirs', 'Sporting Goods', 'Stationery', 'Tobacco', 'Textiles',
    'Toys', 'Woodwork', 'Other Retail'],
  'Other': ['Closed', 'Undefined', 'Radio and Television', 'Stall']
}

const colors = {
  "Clothing Stores": "#2E86C1", "Drug Stores": "#2E86C1", "Entertainment": "#8E44AD", 
  "Food and Beverage": "#F39C12", "Grocery Stores & Supermarkets": "#F39C12", 
  "Lodging": "#138D75", "Restaurants & Bars": "#F39C12", "Services": "#99A3A4", 
  "Specialty Stores": "#2E86C1", "Other": "#000000", "airbnb": "#C0392B"
}

let yearTargets = []
let sestiereTargets = []
let storeTargets = []
let airbnbTargets = []

let timelapsing = false
let paused = false
let yearIndex = 0
let timelapseInterval;

let allYears = []
let allSestieres = []
let allAirbnbs = []

let yearOptions = []
let sestiereOptions = []
let storesOptions = []
let sestiereOptions2 = []
let storesOptions2 = []
let airbnbOptions = []
let airbnbOptions2 = []

const yearFilterDefault = document.querySelector('#yearFilter').innerHTML
const sestiereFilterDefault = document.querySelector('#sestiereFilter').innerHTML
const storeFilterDefault = document.querySelector('#storeFilter').innerHTML
const airbnbFilterDefault = document.querySelector('#airbnbFilter').innerHTML

let popupPresent = false
let radiusStyle = 5

function setBaselines() {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].info.length; j++) {
      if (data[i].info[j].year_collected != "" && !allYears.includes(String(data[i].info[j].year_collected))) {
        allYears.push(String(data[i].info[j].year_collected))
      }
      if (data[i].address_sestiere != "" && !allSestieres.includes(data[i].address_sestiere)) {
        allSestieres.push(data[i].address_sestiere)
      }
    }
  }
  for (let i = 0; i < airbnbData.length; i++) {
    for (let j = 0; j < airbnbData[i].years.length; j++){
      if (!allAirbnbs.includes(String(airbnbData[i].years[j]))) {
        allAirbnbs.push(String(airbnbData[i].years[j]))
      }
    }
  }

  let yearNames = allYears.sort().reverse()
  for (let i = 0; i < yearNames.length; i++) {
    const yearOpt = document.createElement('option')
    yearOpt.value = yearOpt.text = yearNames[i]
    yearOptions.push(yearOpt)
  }

  let sestiereNames = allSestieres.sort()
  for (let i = 0; i < sestiereNames.length; i++) {
    const sesOpt = document.createElement('option')
    sesOpt.value = sesOpt.text = sestiereNames[i]
    sestiereOptions.push(sesOpt)
    const sesOpt2 = document.createElement('option')
    sesOpt2.value = sesOpt2.text = sestiereNames[i]
    sestiereOptions2.push(sesOpt2)
  }

  let airbnbNames = allAirbnbs.sort().reverse()
  for (let i = 0; i < airbnbNames.length; i++) {
    const airOpt = document.createElement('option')
    airOpt.value = airOpt.text = airbnbNames[i]
    airbnbOptions.push(airOpt)
    const airOpt2 = document.createElement('option')
    airOpt2.value = airOpt2.text = airbnbNames[i]
    airbnbOptions2.push(airOpt2)
  }

  const keys = Object.keys(shopTypes)
  for (let i = 0; i < keys.length; i++) {
    const shopOptG = document.createElement('optgroup')
    shopOptG.label = keys[i]
    for (let j = 0; j < shopTypes[keys[i]].length; j++) {
      const shopOpt = document.createElement('option')
      shopOpt.value = shopOpt.text = shopTypes[keys[i]][j]
      shopOptG.appendChild(shopOpt)
    }
    storesOptions.push(shopOptG)

    const shopOptG2 = document.createElement('optgroup')
    shopOptG2.label = keys[i]
    for (let j = 0; j < shopTypes[keys[i]].length; j++) {
      const shopOpt2 = document.createElement('option')
      shopOpt2.value = shopOpt2.text = shopTypes[keys[i]][j]
      shopOptG2.appendChild(shopOpt2)
    }
    storesOptions2.push(shopOptG2)
  }
}

function setFeatures() {
  newfeatures = []

  for (let i = 0; i < airbnbData.length; i++){
    if (airbnbData[i].years.length > 0) {
      let next = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([airbnbData[i].lng, airbnbData[i].lat])),
        years: airbnbData[i].years,
        sestiere: airbnbData[i].address_sestiere,
        type: "airbnb"
      })
      newfeatures.push(next)
    }
  }

  for (let i = 0; i < data.length; i++) {
    if (data[i].info2.length !== 0) {
      let next = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([data[i].lng, data[i].lat])),
        _id: data[i]._id,
        address: data[i]["address_sestiere"] + " " + data[i]["address_num"],
        address_street: data[i]["address_street"],
        address_abbv: abbvs[data[i]["address_sestiere"]] + " " + data[i]["address_num"],
        parent_id: data[i].parent_id,
        last_name: data[i].info[data[i].info.length - 1].store_name,
        info: data[i].info,
        type: "shop"
      })
      newfeatures.push(next)
    }
  }

  const numDisplay = document.querySelector('#numberDisplay')
  const airbnbNumDisplay = document.querySelector('#airbnbNumberDisplay')
  let numcount = 0
  for (let i = 0; i < newfeatures.length; i++) {
    if (newfeatures[i].A.type === "shop") { numcount = numcount + 1 }
  }
  numDisplay.innerText = numcount
  airbnbNumDisplay.innerText = newfeatures.length - numcount
}

function removePopup() {
  popupPresent = false
  overlay.setPosition(undefined);
  closer.blur();
}

function loadingPopup() {
  content.innerHTML = "<h1>Loading...</h1>"
}

function setPopup() {
  closer.onclick = function () {
    removePopup()
    return false;
  };
}

function setMap() {
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
      center: ol.proj.fromLonLat([centerX, centerY]),
      zoom: 14.8
    })
  });

  map.on('singleclick', function (event) {
    if (map.hasFeatureAtPixel(event.pixel) && map.getFeaturesAtPixel(event.pixel)[0].A.type === 'shop') {
      popupPresent = true
      abbvPopup.innerText = ''
      let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
      popupIndex = pointInfo.info.length - 1
      setContent(pointInfo)

      overlay.setOffset([-200, -300])
      overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
    } else { removePopup() }
  });

  map.on('pointermove', function (event) {
    if (!popupPresent && map.hasFeatureAtPixel(event.pixel) && map.getFeaturesAtPixel(event.pixel)[0].A.type === 'shop') {
      let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
      if (abbvPopup.innerText !== pointInfo.address) {
        abbvPopup.style.top = event.originalEvent.pageY + 'px'
        abbvPopup.style.left = event.originalEvent.pageX + 'px'
        if (pointInfo.last_name === '') { abbvPopup.innerText = pointInfo.address_abbv }
        else { abbvPopup.innerHTML = pointInfo.last_name }
      }
    }
    else { abbvPopup.innerText = '' }
  })

  map.on('movestart', function (e) {
    removePopup()
  })

  map.on('moveend', function (e) {
    mapX = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[0]
    mapY = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[1]

    if (mapX < 12.2915) { mapX = 12.2915 }
    if (mapX > 12.379) { mapX = 12.379 }
    if (mapY > 45.453) { mapY = 45.453 }
    if (mapY < 45.412) { mapY = 45.412 }

    map.getView().setCenter(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'));

    if (map.getView().getZoom() < 14.5) {
      map.getView().setZoom(14.5)
      map.getView().setCenter(ol.proj.transform([centerX, centerY], 'EPSG:4326', 'EPSG:3857'));
    }
    if (map.getView().getZoom() > 25) {
      map.getView().setZoom(25)
      map.getView().setCenter(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'));
    }
  });

  overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  map.addOverlay(overlay);
}

function addLayer() {
  let colorkeys = Object.keys(colors)
  let styles = {}
  for (let i = 0; i < colorkeys.length; i++) {
    let fill = new ol.style.Fill({
      color: 'rgba(255,255,255,0.4)'
    });
    let stroke = new ol.style.Stroke({
      color: colors[colorkeys[i]],
      width: 1.75
    });
    styles[colorkeys[i]] = new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: (colorkeys[i] !== "airbnb") ? radiusStyle : radiusStyle/2
      }),
      fill: fill,
      stroke: stroke
    })
  }
  for (let i = 0; i < colorkeys.length; i++) {
    let fill = new ol.style.Fill({
      color: colors[colorkeys[i]]
    });
    fill.setColor(fill.getColor() + '80')
    let stroke = new ol.style.Stroke({
      color: colors[colorkeys[i]],
      width: 1.75
    });
    styles[colorkeys[i] + 'new'] = new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: radiusStyle
      }),
      fill: fill,
      stroke: stroke
    })
  }
  for (let i = 0; i < newfeatures.length; i++){
    if (newfeatures[i].A.type === "shop"){
      let category = ""
      let categories = Object.keys(shopTypes)
      for (let j = 0; j < categories.length; j++){
        if (shopTypes[categories[j]].includes(newfeatures[i].A.info[newfeatures[i].A.info.length-1].store_type)) {
          category = categories[j]
          if (newfeatures[i].A.info[newfeatures[i].A.info.length-1].year_collected === parseInt(allYears[0])) {
            category = category + "new"
          }
        }
      }
      newfeatures[i].setStyle(styles[category])
    }
    else {
      newfeatures[i].setStyle(styles['airbnb'])
    }
  }

  layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: newfeatures
    })
  });
  map.addLayer(layer);
}

function setContent(pointInfo) {
  content.innerHTML = ""

  let information = pointInfo.info
  let currInfo = information[popupIndex]

  const editButton = document.createElement("button");
  editButton.classList.add('outerIcon')
  editButton.innerHTML = '<img class="icons" src="./assets/pencil.png"/>'
  editButton.onclick = function () {
    content.innerHTML = ""

    const imagePreview = document.createElement("img")
    imagePreview.setAttribute("class", "imagePreview")
    imagePreview.setAttribute("width", "200px")
    imagePreview.setAttribute("height", "200px")
    imagePreview.setAttribute("src", currInfo.image_url)
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

    const inputGrid = document.createElement("div")
    inputGrid.classList.add("inputGrid")

    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Name:"
    inputGrid.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    nameInput.value = currInfo.store_name
    inputGrid.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function () { nameInput.value = "" }
    inputGrid.appendChild(clearName)

    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year:"
    inputGrid.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    yearInput.value = currInfo.year_collected
    inputGrid.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    inputGrid.appendChild(clearYear)

    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Type:"
    inputGrid.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    for (let i = 0; i < storesOptions2.length; i++) {
      storeInput.add(storesOptions2[i])
    }
    storeInput.value = currInfo.store_type
    inputGrid.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function () { storeInput.value = "Closed" }
    inputGrid.appendChild(clearStore)

    const noteLabel = document.createElement("label")
    noteLabel.setAttribute("for", "noteInput")
    noteLabel.innerText = "Note:"
    inputGrid.appendChild(noteLabel)
    const noteInput = document.createElement("input")
    noteInput.setAttribute("id", "noteInput")
    noteInput.setAttribute("name", "noteInput")
    noteInput.value = currInfo.note
    inputGrid.appendChild(noteInput)
    const clearNote = document.createElement("button")
    clearNote.innerText = "Clear"
    clearNote.onclick = function () { noteInput.value = "" }
    inputGrid.appendChild(clearNote)
    content.appendChild(inputGrid)

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

    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("scrollButton")
    cancelButton.classList.add("leftButton")
    cancelButton.onclick = function () { setContent(pointInfo) }
    content.appendChild(cancelButton)

    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("scrollButton")
    submitButton.classList.add("rightButton")
    submitButton.onclick = function () {
      if (isNaN(yearInput.value)) {
        alert("Year Collected must be a number")
      }
      else if (flagBox.checked && noteInput.value === '') {
        alert("A flagged entry requires a note")
      }
      else {
        loadingPopup()
        if (imageInput.files.length !== 0) {
          const formData = new FormData()
          formData.append('myFile', imageInput.files[0])
          fetch("/upload2", {
            method: "POST",
            body: formData
          })
            .then(response => response.json())
            .then(data => {
              const imgUpload = {
                imgName: yearInput.value + pointInfo.address,
                parents: "",
                imgsrc: data.path
              }
              fetch("/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(imgUpload)
              })
                .then(function (response) {
                  return response.json()
                })
                .then(function (response) {
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

                  fetch("/edit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addedJSON)
                  })
                    .then(function () {
                      const savedId = pointInfo._id
                      let savedInfo;
                      const editing = new Promise((request, response) => {
                        map.removeLayer(layer)
                        fetch("/load", {
                          method: "GET"
                        })
                          .then(function (response) {
                            return response.json()
                          })
                          .then(function (json) {
                            const nonDeleted = []
                            for (let i = 0; i < json.length; i++) {
                              let len = json[i].info.length
                              const newInfo = []
                              for (let j = 0; j < json[i].info.length; j++) {
                                if (json[i].info[j].deleted) { len = len - 1 }
                                else { newInfo.push(json[i].info[j]) }
                              }
                              if (len === json[i].info.length) {
                                const newInsert = json[i]
                                newInsert.info2 = newInfo
                                nonDeleted.push(newInsert)
                              }
                              else if (len > 0) {
                                let newInsert = json[i]
                                newInsert.info = newInfo
                                newInsert.info2 = newInfo
                                nonDeleted.push(newInsert)
                              }
                            }
                            data = nonDeleted
                            dataAll = JSON.parse(JSON.stringify(data))
                            return data
                          })
                          .then(function (data) {
                            setFeatures()
                            setPopup()
                            addLayer()
                            setYearFilter()
                            setSestiereFilter()
                            setStoreFilter()
                            filterFeatures()
                            return 0
                          })
                          .then(function () {
                            for (let i = 0; i < newfeatures.length; i++) {
                              if (newfeatures[i].A._id === savedId)
                                savedInfo = newfeatures[i].A
                            }
                            setContent(savedInfo)
                            return 0
                          })
                      })
                      return 0
                    })
                })
            })
        }
        else {
          const addedJSON = {
            _id: pointInfo._id,
            parent_id: pointInfo.parent_id,
            address: pointInfo.address,
            address_street: pointInfo.address_street,
            info: information,
            name: nameInput.value,
            note: noteInput.value,
            flagged: flagBox.checked,
            image: currInfo.image_url,
            year: parseInt(yearInput.value, 10),
            store: storeInput.value,
            group: "Undefined",
            nace: "Undefined"
          }

          fetch("/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(addedJSON)
          })
            .then(function () {
              const savedId = pointInfo._id
              let savedInfo;
              const editing = new Promise((request, response) => {
                map.removeLayer(layer)
                fetch("/load", {
                  method: "GET"
                })
                  .then(function (response) {
                    return response.json()
                  })
                  .then(function (json) {
                    const nonDeleted = []
                    for (let i = 0; i < json.length; i++) {
                      let len = json[i].info.length
                      const newInfo = []
                      for (let j = 0; j < json[i].info.length; j++) {
                        if (json[i].info[j].deleted) { len = len - 1 }
                        else { newInfo.push(json[i].info[j]) }
                      }
                      if (len === json[i].info.length) {
                        const newInsert = json[i]
                        newInsert.info2 = newInfo
                        nonDeleted.push(newInsert)
                      }
                      else if (len > 0) {
                        let newInsert = json[i]
                        newInsert.info = newInfo
                        newInsert.info2 = newInfo
                        nonDeleted.push(newInsert)
                      }
                    }
                    data = nonDeleted
                    dataAll = JSON.parse(JSON.stringify(data))
                    return data
                  })
                  .then(function (data) {
                    setFeatures()
                    setPopup()
                    addLayer()
                    setYearFilter()
                    setSestiereFilter()
                    setStoreFilter()
                    filterFeatures()
                    return 0
                  })
                  .then(function () {
                    for (let i = 0; i < newfeatures.length; i++) {
                      if (newfeatures[i].A._id === savedId)
                        savedInfo = newfeatures[i].A
                    }
                    setContent(savedInfo)
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

  const plusButton = document.createElement("button")
  plusButton.classList.add('outerIcon')
  plusButton.innerHTML = '<img class="icons" src="./assets/plus.png"/>'
  plusButton.onclick = function () {
    content.innerHTML = ""

    const imagePreview = document.createElement("img")
    imagePreview.setAttribute("class", "imagePreview")
    imagePreview.setAttribute("width", "200px")
    imagePreview.setAttribute("height", "200px")
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

    const inputGrid = document.createElement("div")
    inputGrid.classList.add("inputGrid")

    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Name:"
    inputGrid.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    nameInput.value = currInfo.store_name
    inputGrid.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function () { nameInput.value = "" }
    inputGrid.appendChild(clearName)

    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year:"
    inputGrid.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    yearInput.value = new Date().getFullYear()
    inputGrid.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    inputGrid.appendChild(clearYear)

    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Type:"
    inputGrid.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    for (let i = 0; i < storesOptions2.length; i++) {
      storeInput.add(storesOptions2[i])
    }
    storeInput.value = currInfo.store_type
    inputGrid.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function () { storeInput.value = "Closed" }
    inputGrid.appendChild(clearStore)

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

    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("scrollButton")
    cancelButton.classList.add("leftButton")
    cancelButton.onclick = function () { setContent(pointInfo) }
    content.appendChild(cancelButton)

    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("scrollButton")
    submitButton.classList.add("rightButton")
    submitButton.onclick = function () {
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
        loadingPopup()
        const formData = new FormData()
        formData.append('myFile', imageInput.files[0])
        fetch("/upload2", {
          method: "POST",
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            const imgUpload = {
              imgName: yearInput.value + pointInfo.address,
              parents: "",
              imgsrc: data.path
            }
            fetch("/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(imgUpload)
            })
              .then(function (response) {
                return response.json()
              })
              .then(function (response) {
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
                fetch("/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(addedJSON)
                })
                  .then(function (response) {
                    const savedId = pointInfo._id
                    let savedInfo;
                    map.removeLayer(layer)
                    fetch("/load", {
                      method: "GET"
                    })
                      .then(function (response) {
                        return response.json()
                      })
                      .then(function (json) {
                        const nonDeleted = []
                        for (let i = 0; i < json.length; i++) {
                          let len = json[i].info.length
                          const newInfo = []
                          for (let j = 0; j < json[i].info.length; j++) {
                            if (json[i].info[j].deleted) { len = len - 1 }
                            else { newInfo.push(json[i].info[j]) }
                          }
                          if (len === json[i].info.length) {
                            const newInsert = json[i]
                            newInsert.info2 = newInfo
                            nonDeleted.push(newInsert)
                          }
                          else if (len > 0) {
                            let newInsert = json[i]
                            newInsert.info = newInfo
                            newInsert.info2 = newInfo
                            nonDeleted.push(newInsert)
                          }
                        }
                        data = nonDeleted
                        dataAll = JSON.parse(JSON.stringify(data))
                        return data
                      })
                      .then(function (data) {
                        setFeatures()
                        setPopup()
                        addLayer()
                        setYearFilter()
                        setSestiereFilter()
                        setStoreFilter()
                        filterFeatures()
                        return 0
                      })
                      .then(function () {
                        for (let i = 0; i < newfeatures.length; i++) {
                          if (newfeatures[i].A._id === savedId)
                            savedInfo = newfeatures[i].A
                        }
                        popupIndex = savedInfo.info.length - 1
                        setContent(savedInfo)
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

  const deleteButton = document.createElement("button")
  deleteButton.classList.add('outerIcon')
  deleteButton.innerHTML = '<img class="icons" src="./assets/trash.png"/>'
  deleteButton.onclick = function () {
    loadingPopup()
    const addedJSON = {
      _id: pointInfo._id,
      info: information,
      index: popupIndex
    }
    fetch("/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addedJSON)
    })
      .then(function () {
        const deleting = new Promise((request, response) => {
          map.removeLayer(layer)
          fetch("/load", {
            method: "GET"
          })
            .then(function (response) {
              return response.json()
            })
            .then(function (json) {
              const nonDeleted = []
              for (let i = 0; i < json.length; i++) {
                let len = json[i].info.length
                const newInfo = []
                for (let j = 0; j < json[i].info.length; j++) {
                  if (json[i].info[j].deleted) { len = len - 1 }
                  else { newInfo.push(json[i].info[j]) }
                }
                if (len === json[i].info.length) {
                  const newInsert = json[i]
                  newInsert.info2 = newInfo
                  nonDeleted.push(newInsert)
                }
                else if (len > 0) {
                  let newInsert = json[i]
                  newInsert.info = newInfo
                  newInsert.info2 = newInfo
                  nonDeleted.push(newInsert)
                }
              }
              data = nonDeleted
              dataAll = JSON.parse(JSON.stringify(data))
              return data
            })
            .then(function (data) {
              setFeatures()
              setPopup()
              addLayer()
              setYearFilter()
              setSestiereFilter()
              setStoreFilter()
              removePopup()
              filterFeatures()
              return 0
            })
        })
        return 0
      })
  }

  const popupGrid = document.createElement("div")
  popupGrid.classList.add("popupGrid")

  const col1 = document.createElement("h4")
  if (currInfo.flagged) { col1.innerText = 'Flagged' }
  const col5 = document.createElement("h2")
  col5.innerText = currInfo.year_collected

  col1.classList.add('popcol1')
  editButton.classList.add('popcol2')
  plusButton.classList.add('popcol3')
  deleteButton.classList.add('popcol4')
  col5.classList.add('popcol5')

  popupGrid.appendChild(col1)
  popupGrid.appendChild(editButton)
  popupGrid.appendChild(plusButton)
  popupGrid.appendChild(deleteButton)
  popupGrid.appendChild(col5)

  content.appendChild(popupGrid)

  const displayedInfo = document.createElement("div")
  if (currInfo.store_name !== "") {
    displayedInfo.innerHTML = '<h1>' + currInfo.store_name + '</h1>'
      + '<h3>' + currInfo.address + '</h3>'
  }
  else {
    displayedInfo.innerHTML = '<h1>' + currInfo.address + '</h1>'
  }
  displayedInfo.innerHTML = displayedInfo.innerHTML
    + '<img src="' + currInfo.image_url + '" id="oldImagePreview" width="200px" height="200px">'
    + '<h3>' + currInfo.address_street + '</h3>'
    + '<h3>' + currInfo.store_type + '</h3>'
    + '<p>' + currInfo.note + '</p>'
  
  content.appendChild(displayedInfo)  
  
  const oldImagePreview = document.querySelector('#oldImagePreview')
  oldImagePreview.onclick = function () {
    if(currInfo.image_url.length > 0) {
    window.open(currInfo.image_url.substring(0, currInfo.image_url.length - 16), '_blank');
    }
  }

  const pastButton = document.createElement("button");
  pastButton.innerText = "Previous Entry";
  pastButton.classList.add("leftButton")
  pastButton.classList.add('scrollButton');
  pastButton.onclick = function () {
    if (popupIndex > 0) {
      popupIndex = popupIndex - 1
      setContent(pointInfo)
    }
  }
  if (popupIndex === 0) {
    pastButton.style.backgroundColor = "grey";
    pastButton.disabled = true
  }
  else { pastButton.style.backgroundColor = "gainsboro" }
  content.appendChild(pastButton)

  const futureButton = document.createElement("button");
  futureButton.innerText = "Next Entry";
  futureButton.classList.add("rightButton")
  futureButton.classList.add('scrollButton');
  futureButton.onclick = function () {
    if (popupIndex < information.length - 1) {
      popupIndex = popupIndex + 1
      setContent(pointInfo)
    }
  }
  if (popupIndex === information.length - 1) {
    futureButton.style.backgroundColor = "grey";
    futureButton.disabled = true
  }
  else { futureButton.style.backgroundColor = "gainsboro" }
  content.appendChild(futureButton)
}

function gotoPosition(position) {
  const lat = position.coords.latitude
  const lng = position.coords.longitude

  if (lng < 12.2915 || lng > 12.379 || lat > 45.453 || lat < 45.425) {
    alert("Invalid Coordinates")
  }
  else {
    map.getView().setCenter(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(19)
  }
}

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

function setGoToLocation() {
  const gotoLocation = document.querySelector('#gotoLocation')
  gotoLocation.onclick = function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(gotoPosition, showError);
    }
    else {
      alert('Geolocation not supported')
    }
  }
}

function setGoHome() {
  const goHome = document.querySelector('#goHome')
  goHome.onclick = function () {
    map.getView().setZoom(14.5)
    map.getView().setCenter(ol.proj.transform([centerX, centerY], 'EPSG:4326', 'EPSG:3857'))
  }
}

function setDownload() {
  const downloadButton = document.querySelector('#download')
  downloadButton.onclick = function () {
    var element = document.createElement('a');

    let csvData = 'ID, Latitude, Longitude, Name, Number, Address, Sestiere, Year, Type, Closed?, New?, Tourist?, Artisan?, Lodging?\n'
    for (let i = 0; i < data.length; i++) {
      if (data[i].info2.length !== 0) {
        for (let j = 0; j < data[i].info.length; j++) {
          const thisInfo = data[i].info[j]
          csvData = csvData + data[i].parent_id + ', '
            + data[i].lat + ', '
            + data[i].lng + ', '
            + String(thisInfo.store_name).split(',').join("") + ', '
            + data[i].address_num + ', '
            + String(data[i].address_street).split(',').join("") + ', '
            + data[i].address_sestiere + ', '
            + thisInfo.year_collected + ', '
            + thisInfo.store_type + ', '

          if (j === data[i].info.length - 1) { csvData = csvData + 'N/A, ' }
          else if (thisInfo.store_type === data[i].info[j + 1].store_type && thisInfo.store_type !== 'Closed') {
            csvData = csvData + 'False, '
          }
          else { csvData = csvData + 'True, ' }

          if (j === 0 || (data[i].info[j-1].store_type !== thisInfo.store_type) && thisInfo.store_type !== 'Closed') { 
            csvData = csvData + 'True, ' 
          }
          else {
            csvData = csvData + 'False, '
          }

          const touristTypes = ['Mask', 'Souvenirs']
          const artisanTypes = ['Mask', 'Bakery', 'Butcher', 'Pizzeria', 'Barber', 'Hair Salon', 'Jewelry Repair',
            'Leather Repair', 'Masseuse', 'Nail Salon', 'Spa', 'Tailor', 'Tattoo and Piercing',
            'Wedding', 'Antiques', 'Florist', 'Glass', 'Jewelry', 'Knives', 'Leather Goods',
            'Pawn Shop', 'Woodwork', 'Picture Frames']
          const lodgingTypes = ['Bed and Breakfast', 'Guest Houses', 'Hotel', 'Hotel with Restaurant', 'Hostel']
          csvData = csvData + (touristTypes.includes(thisInfo.store_type) ? 'True' : 'False') + ', '
            + (artisanTypes.includes(thisInfo.store_type) ? 'True' : 'False') + ', '
            + (lodgingTypes.includes(thisInfo.store_type) ? 'True' : 'False') + '\n'
        }
      }
    }

    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
    element.setAttribute('download', 'VeniceData.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

function setAddLocation() {
  const addLocation = document.querySelector('#addLocation')
  addLocation.onclick = function () {
    popupPresent = true
    overlay.setOffset([-200, -300])
    overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))

    content.innerHTML = ""

    const sestiereLabel = document.createElement("label")
    sestiereLabel.setAttribute("for", "sestiereInput")
    sestiereLabel.innerText = "Sestiere: "
    content.appendChild(sestiereLabel)
    const sestiereInput = document.createElement("select")
    sestiereInput.setAttribute("id", "sestiereInput")
    sestiereInput.setAttribute("name", "sestiereInput")
    for (let i = 0; i < sestiereOptions2.length; i++) {
      sestiereInput.add(sestiereOptions2[i])
    }
    content.appendChild(sestiereInput)
    content.appendChild(document.createElement("br"))

    const inputGrid1 = document.createElement("div")
    inputGrid1.classList.add('inputGrid2')

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

    const findCoords = document.createElement("button")
    findCoords.innerText = "Find Coordinates"
    findCoords.classList.add("scrollButton")
    findCoords.style.width = "150px"
    findCoords.onclick = function () {
      removePopup()

      alert("Click a location to set the coordinates of the new store")

      map.on('singleclick', function (event) {
        popupPresent = true
        const coords = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
        latInput.value = coords[1]
        lngInput.value = coords[0]

        map.on('singleclick', function (event) {
          if (map.hasFeatureAtPixel(event.pixel) && map.getFeaturesAtPixel(event.pixel)[0].A.type === 'shop') {
            popupPresent = true
            abbvPopup.innerText = ''
            let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
            popupIndex = pointInfo.info.length - 1
            setContent(pointInfo)

            overlay.setOffset([-200, -300])
            overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
          } else { removePopup() }
        });

        overlay.setOffset([-200, -300])
        overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
      })
    }
    content.appendChild(findCoords)
    content.appendChild(document.createElement("br"))

    const imagePreview = document.createElement("img")
    imagePreview.setAttribute("class", "imagePreview")
    imagePreview.setAttribute("width", "200px")
    imagePreview.setAttribute("height", "200px")
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

    const inputGrid2 = document.createElement("div")
    inputGrid2.classList.add('inputGrid2')

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

    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year:"
    inputGrid2.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    yearInput.value = new Date().getFullYear()
    inputGrid2.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    inputGrid2.appendChild(clearYear)

    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Type:"
    inputGrid2.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    for (let i = 0; i < storesOptions2.length; i++) {
      storeInput.add(storesOptions2[i])
    }
    inputGrid2.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function () { storeInput.value = "Closed" }
    inputGrid2.appendChild(clearStore)

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

    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("scrollButton")
    cancelButton.classList.add("leftButton")
    cancelButton.onclick = function () {
      removePopup()
    }
    content.appendChild(cancelButton)

    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("scrollButton")
    submitButton.classList.add("rightButton")
    submitButton.onclick = function () {
      if (numberInput.value = "") {
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
        loadingPopup()
        const formData = new FormData()
        formData.append('myFile', imageInput.files[0])
        fetch("/upload2", {
          method: "POST",
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            const imgUpload = {
              imgName: yearInput.value + sestiereInput.value + ' ' + numberInput.value,
              parents: "",
              imgsrc: data.path
            }
            fetch("/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(imgUpload)
            })
              .then(function (response) {
                return response.json()
              })
              .then(function (response) {
                const addedJSON = {
                  parent_id: dataAll.length + 1,
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

                fetch("/addLoc", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(addedJSON)
                })
                  .then(function () {
                    const editing = new Promise((request, response) => {
                      map.removeLayer(layer)
                      fetch("/load", {
                        method: "GET"
                      })
                        .then(function (response) {
                          return response.json()
                        })
                        .then(function (json) {
                          const nonDeleted = []
                          for (let i = 0; i < json.length; i++) {
                            let len = json[i].info.length
                            const newInfo = []
                            for (let j = 0; j < json[i].info.length; j++) {
                              if (json[i].info[j].deleted) { len = len - 1 }
                              else { newInfo.push(json[i].info[j]) }
                            }
                            if (len === json[i].info.length) {
                              const newInsert = json[i]
                              newInsert.info2 = newInfo
                              nonDeleted.push(newInsert)
                            }
                            else if (len > 0) {
                              let newInsert = json[i]
                              newInsert.info = newInfo
                              newInsert.info2 = newInfo
                              nonDeleted.push(newInsert)
                            }
                          }
                          data = nonDeleted
                          dataAll = JSON.parse(JSON.stringify(data))
                          return data
                        })
                        .then(function (data) {
                          setFeatures()
                          setPopup()
                          addLayer()
                          setYearFilter()
                          setSestiereFilter()
                          setStoreFilter()
                          removePopup()
                          filterFeatures()
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

function setCheckboxes() {
  const flagFilter = document.querySelector('#flagFilter')
  flagFilter.innerHTML = '<input class="checkbox" type="checkbox" id="flaggedbox">'
    + '<label for="flaggedbox">Flagged</label>'
  const flaggedBox = document.querySelector('#flaggedbox')
  flaggedBox.addEventListener("change", filterFeatures)

  const openFilter = document.querySelector('#openFilter')
  openFilter.innerHTML = '<input class="checkbox" type="checkbox" id="openbox">'
    + '<label for="openbox">Open Only</label>'
  const openBox = document.querySelector('#openbox')
  openBox.addEventListener("change", filterFeatures)

  const newFilter = document.querySelector('#newFilter')
  newFilter.innerHTML = '<input class="checkbox" type="checkbox" id="newbox">'
    + '<label for="newbox">New Only</label>'
  const newBox = document.querySelector('#newbox')
  newBox.addEventListener("change", filterFeatures)

  const layerFilter = document.querySelector('#layerFilter')
  layerFilter.innerHTML = '<input class="checkbox" type="checkbox" id="layerbox">'
    + '<label for="layerbox">Shops & Airbnbs</label>'
  const layerBox = document.querySelector('#layerbox')
  layerBox.addEventListener("change", filterFeatures)
}

function setYearFilter() {
  const yearFilter = document.querySelector('#yearFilter')
  yearFilter.innerHTML = yearFilterDefault

  const yearSelect = document.createElement('select')
  yearSelect.multiple = true
  yearSelect.id = 'yearSelect'
  yearSelect.onchange = filterFeatures

  for (var i = 0; i < yearOptions.length; i++) {
    yearSelect.appendChild(yearOptions[i]);
  }

  yearFilter.appendChild(yearSelect)

  const yearSlimSelect = new SlimSelect({
    select: '#yearSelect',
    allowDeselectOption: true,
    allowDeselect: true,
    closeOnSelect: true,
    placeholderText: "Add Filters"
  });
}

function setSestiereFilter() {
  const sestiereFilter = document.querySelector('#sestiereFilter')
  sestiereFilter.innerHTML = sestiereFilterDefault

  const sestiereSelect = document.createElement('select')
  sestiereSelect.multiple = true
  sestiereSelect.id = 'sestiereSelect'
  sestiereSelect.onchange = filterFeatures

  for (var i = 0; i < sestiereOptions.length; i++) {
    sestiereSelect.appendChild(sestiereOptions[i]);
  }

  sestiereFilter.appendChild(sestiereSelect)

  const sestiereSlimSelect = new SlimSelect({
    select: '#sestiereSelect',
    allowDeselectOption: true,
    allowDeselect: true,
    closeOnSelect: true,
    placeholderText: "Add Filters"
  });
}

function setStoreFilter() {
  const storeFilter = document.querySelector('#storeFilter')
  storeFilter.innerHTML = storeFilterDefault

  const storeSelect = document.createElement('select')
  storeSelect.multiple = true
  storeSelect.id = 'storeSelect'
  storeSelect.onchange = filterFeatures

  for (var i = 0; i < storesOptions.length; i++) {
    storeSelect.appendChild(storesOptions[i]);
  }

  storeFilter.appendChild(storeSelect)

  const storeSlimSelect = new SlimSelect({
    select: '#storeSelect',
    selectByGroup: true,
    allowDeselectOption: true,
    allowDeselect: true,
    closeOnSelect: true,
    placeholderText: "Add Filters"
  });
}

function setAirbnbFilter() {
  const airbnbFilter = document.querySelector('#airbnbFilter')
  airbnbFilter.innerHTML = airbnbFilterDefault

  const airbnbSelect = document.createElement('select')
  airbnbSelect.multiple = true
  airbnbSelect.id = 'airbnbSelect'
  airbnbSelect.onchange = filterFeatures

  for (var i = 0; i < airbnbOptions.length; i++) {
    airbnbSelect.appendChild(airbnbOptions[i]);
  }

  airbnbFilter.appendChild(airbnbSelect)

  const airbnbSlimSelect = new SlimSelect({
    select: '#airbnbSelect',
    allowDeselectOption: true,
    allowDeselect: true,
    closeOnSelect: true,
    placeholderText: "Add Layers"
  });
}

function setTimelapse() {
  const timelapseButton = document.querySelector('#timelapseButton')
  timelapseButton.onclick = startTimelapse
  timelapseButton.style.backgroundColor = "gainsboro"

  const stopTimelapseButton = document.querySelector('#stopTimelapseButton')
  stopTimelapseButton.onclick = stopTimelapse
  stopTimelapseButton.style.backgroundColor = "grey"
  stopTimelapseButton.disabled = true
}

function startTimelapse() {
  const timelapseButton = document.querySelector('#timelapseButton')
  if (paused) {
    paused = false
    timelapseButton.innerText = 'Resume Cycle'
    clearInterval(timelapseInterval)
  }
  else {
    timelapsing = true
    paused = true
    timelapseButton.innerText = 'Pause Cycle'
    const yearDisplay = document.querySelector('#yearDisplay')

    const stopTimelapseButton = document.querySelector('#stopTimelapseButton')
    stopTimelapseButton.style.backgroundColor = "gainsboro"
    stopTimelapseButton.disabled = false

    const yearSelecting = document.querySelector('#yearSelect')
    let allYearTargets = []
    for (let i = yearSelecting.selectedOptions.length - 1; i >= 0; i--) {
      allYearTargets.push(yearSelecting.selectedOptions[i].value)
    }

    if (allYearTargets.length === 0) {
      allYearTargets = allYears.sort()
    }

    yearTargets = allYearTargets[yearIndex]
    filterFeatures()
    yearDisplay.innerText = allYearTargets[yearIndex]
    yearIndex = yearIndex + 1
    if (yearIndex === allYearTargets.length) { yearIndex = 0 }

    timelapseInterval = setInterval(function () {
      yearTargets = allYearTargets[yearIndex]
      filterFeatures()
      yearDisplay.innerText = allYearTargets[yearIndex]
      yearIndex = yearIndex + 1
      if (yearIndex === allYearTargets.length) { yearIndex = 0 }
    }, 1000)
  }
}

function stopTimelapse() {
  yearIndex = 0
  timelapsing = false
  paused = false
  clearInterval(timelapseInterval)
  const timelapseButton = document.querySelector('#timelapseButton')
  timelapseButton.innerText = 'Cycle Years'
  timelapseButton.onclick = startTimelapse

  const yearDisplay = document.querySelector('#yearDisplay')
  yearDisplay.innerText = ''

  const stopTimelapseButton = document.querySelector('#stopTimelapseButton')
  stopTimelapseButton.style.backgroundColor = "grey"
  stopTimelapseButton.disabled = true

  filterFeatures()
}

function setChangeSize() {
  const changeSizeButton = document.querySelector('#changeSize')
  const changeSizeIcon = document.querySelector('#changeSizeImg')
  changeSizeButton.onclick = function () {
    if (radiusStyle === 5) {
      changeSizeIcon.src = "./assets/reduce.png"
      radiusStyle = 15
    }
    else {
      changeSizeIcon.src = "./assets/enlarge.png"
      radiusStyle = 5
    }
    filterFeatures()
  }
}

function filterFeatures() {
  removePopup()

  if (!timelapsing) {
    const yearSelecting = document.querySelector('#yearSelect')
    yearTargets = []
    for (let i = 0; i < yearSelecting.selectedOptions.length; i++) {
      yearTargets.push(yearSelecting.selectedOptions[i].value)
    }
  }

  const sestiereSelecting = document.querySelector('#sestiereSelect')
  sestiereTargets = []
  for (let i = 0; i < sestiereSelecting.selectedOptions.length; i++) {
    sestiereTargets.push(sestiereSelecting.selectedOptions[i].value)
  }

  const storeSelecting = document.querySelector('#storeSelect')
  storeTargets = []
  for (let i = 0; i < storeSelecting.selectedOptions.length; i++) {
    storeTargets.push(storeSelecting.selectedOptions[i].value)
  }

  const airbnbSelecting = document.querySelector('#airbnbSelect')
  airbnbTargets = []
  for (let i = 0; i < airbnbSelecting.selectedOptions.length; i++) {
    airbnbTargets.push(airbnbSelecting.selectedOptions[i].value)
  }

  data = JSON.parse(JSON.stringify(dataAll))
  airbnbData = JSON.parse(JSON.stringify(airbnbDataAll))

  let flagged = document.querySelector('#flaggedbox')
  if (flagged.checked) {
    for (let i = 0; i < data.length; i++) {
      data[i].info2 = data[i].info2.filter(item => item.flagged)
    }
  }

  let openOnly = document.querySelector('#openbox')
  if (openOnly.checked) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].info2.length !== 0 && data[i].info2[data[i].info2.length-1].store_type === 'Closed') {
        data[i].info2 = []
      }
    }
  }

  let newOnly = document.querySelector('#newbox')
  if (newOnly.checked) {
    for (let i = 0; i < data.length; i++) { 
      if (data[i].info.length !== 1 || data[i].info[0].year_collected !== parseInt(allYears[0])) {
        data[i].info2 = []
      }
    }
  }

  if (yearTargets.length !== 0) {
    for (let i = 0; i < data.length; i++) {
      data[i].info2 = data[i].info2.filter(item => yearTargets.includes(String(item.year_collected)))
    }
  }
  if (sestiereTargets.length !== 0) {
    for (let i = 0; i < data.length; i++) {
      if (!sestiereTargets.includes(data[i].address_sestiere)) {
        data[i].info2 = []
      }
    }
    for (let i = 0; i < airbnbData.length; i++) {
      if (!sestiereTargets.includes(airbnbData[i].address_sestiere)) {
        airbnbData[i].years = []
      }
    }
  }
  if (storeTargets.length !== 0) {
    for (let i = 0; i < data.length; i++) {
      data[i].info2 = data[i].info2.filter(item => storeTargets.includes(item.store_type))
    }
  }
  for (let i = 0; i < airbnbData.length; i++) {
    let found = false;
    for (let j = 0; j < airbnbData[i].years.length; j++) {
      if (airbnbTargets.indexOf(airbnbData[i].years[j]) !== -1) {
        found = true;
        break;
      }
    } 
    if (!found) { airbnbData[i].years = [] }
  }

  map.removeLayer(layer)

  setFeatures()
  addLayer()
}

window.onload = function () {
  setMap()
  const init = new Promise((request, response) => {
    map.removeLayer(layer)
    fetch("/load", {
      method: "GET"
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        const nonDeleted = []
        for (let i = 0; i < json.length; i++) {
          let len = json[i].info.length
          const newInfo = []
          for (let j = 0; j < json[i].info.length; j++) {
            if (json[i].info[j].deleted) { len = len - 1 }
            else { newInfo.push(json[i].info[j]) }
          }
          if (len === json[i].info.length) {
            const newInsert = json[i]
            newInsert.info2 = newInfo
            nonDeleted.push(newInsert)
          }
          else if (len > 0) {
            const newInsert = json[i]
            newInsert.info = newInfo
            newInsert.info2 = newInfo
            nonDeleted.push(newInsert)
          }
        }
        data = nonDeleted
        dataAll = JSON.parse(JSON.stringify(data))
        return data
      })
      .then(function (data) {
        fetch("/loadairbnb", {
          method: "GET"
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (json) {
            airbnbData = json
            airbnbDataAll = JSON.parse(JSON.stringify(airbnbData))
            return 0
          })
          .then(function (data) {
            setBaselines()
            setFeatures()
            setPopup()
            addLayer()
            setGoToLocation()
            setGoHome()
            setDownload()
            setAddLocation()
            setCheckboxes()
            setYearFilter()
            setSestiereFilter()
            setStoreFilter()
            setAirbnbFilter()
            setTimelapse()
            setChangeSize()
            filterFeatures()
            return 0
          })
      })
  })
}