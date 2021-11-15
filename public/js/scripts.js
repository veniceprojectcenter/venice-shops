let data
let dataAll

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

let years = []

let flagTarget;
let yearTargets = []
let sestiereTargets = []
let storeTargets = []

let allYears = []
let allSestieres = []
let allStores = []

let yearOptions = []
let sestiereOptions = []
let storesOptions = []
let sestiereOptions2 = []
let storesOptions2 = []

const yearFilterDefault = document.querySelector('#yearFilter').innerHTML
const sestiereFilterDefault = document.querySelector('#sestiereFilter').innerHTML
const storeFilterDefault = document.querySelector('#storeFilter').innerHTML

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

  const shopTypes = {
    'Clothing Stores': ['Clothing','Costumes',"Children's Clothing", 'Gloves','Mask',"Men's Clothing",'Shoes',
      'Undergarments',"Women's Clothing"],
    'Drug Stores': ['Cosmetics','Medical Goods','Pharmacy'],
    'Entertainment': ['Casino','Entertainment','Movie Theater'],
    'Food and Beverage Stores': ['Bakery','Butcher','Candy','Coffee','Dairy','Gelateria','Liquor','Produce',
      'Seafood','Wine'],
    'Grocery Stores & Supermarkets': ['General Store','Grocery Store'],
    'Lodging': ['Bed and Breakfast','Guest Houses','Hotel','Hotel with Restaurant','Hostel'],
    'Restaurants & Bars': ['Bar','Cafe','Fast Food','Pizzeria','Restaurant'],
    'Services': ['Apartment Rental','Bank','Barber','Car Rental','Computer Services','Delivery','Dry Cleaner',
      'Electronics Repair','Film Studio','Fitness','Funeral Services','Graphic Design','Hair Salon','Hospital',
      'Jewelry Repair','Laundromat','Leather Repair','Library','Masseuse','Money Transfer','Nail Salon',
      'Perfume','Photo Store','Photocopy','Photographer','Post Office','Printing','Real Estate','Repair','Spa',
      'Study Agency','Swim','Tailor','Tattoo and Piercing','Transportation','Travel Agency','Veterinarian',
      'Warehouse','Wedding'],
    'Specialty Stores': ['Accessories','Antiques','Art','Art Gallery','Boat Supplies','Books',
      'Coins and Stamps','Computer','Electrical Appliances','Electronics','Exchange','Eyewear','Fishing',
      'Florist','Furniture','Glass','Hardware','Household Goods','Jewelry','Knives','Leather Goods',
      'Light Store','Luxury','Metal Work','Music','Musical Instruments','Newspaper','Office Supplies',
      'Pawn Shop','Pet Store','Picture Frames','Souvenirs','Sporting Goods','Stationery','Tobacco','Textiles',
      'Toys','Woodwork','Other Retail'],
    'Other': ['Closed','Undefined','Radio and Television','Stall']
  }
  const keys = Object.keys(shopTypes)
  for (let i = 0; i < keys.length; i++){
    const shopOptG = document.createElement('optgroup')
    shopOptG.label = keys[i]
    for (let j = 0; j < shopTypes[keys[i]].length; j++){
      const shopOpt = document.createElement('option')
      shopOpt.value = shopOpt.text = shopTypes[keys[i]][j]
      shopOptG.appendChild(shopOpt)
    }
    storesOptions.push(shopOptG)

    const shopOptG2 = document.createElement('optgroup')
    shopOptG2.label = keys[i]
    for (let j = 0; j < shopTypes[keys[i]].length; j++){
      const shopOpt2 = document.createElement('option')
      shopOpt2.value = shopOpt2.text = shopTypes[keys[i]][j]
      shopOptG2.appendChild(shopOpt2)
    }
    storesOptions2.push(shopOptG2)
  }
}

function setFeatures() {
  newfeatures = []
  for (let i = 0; i < data.length; i++) {
    if (data[i].info2.length !== 0) {
      let next = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([data[i].lng, data[i].lat])),
        _id: data[i]._id,
        address: data[i]["address_sestiere"] + " " + data[i]["address_num"],
        address_street: data[i]["address_street"],
        parent_id: data[i].parent_id,
        info: data[i].info
      })
      newfeatures.push(next)
    }
  }
  const numDisplay = document.querySelector('#numberDisplay')
  numDisplay.innerText = newfeatures.length
}

function removePopup() {
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

  addLayer();

  map.on('singleclick', function (event) {
    if (map.hasFeatureAtPixel(event.pixel) === true) {
      let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
      popupIndex = pointInfo.info.length - 1
      setContent(pointInfo)

      overlay.setOffset([-200, -300])
      overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
    } else {
      removePopup()
    }
  });

  map.on('movestart', function (e) {
    removePopup()
  })

  map.on('moveend', function (e) {
    mapX = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[0]
    mapY = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[1]

    if (mapX < 12.2915) { mapX = 12.2915 }
    if (mapX > 12.379) { mapX = 12.379 }
    if (mapY > 45.453) { mapY = 45.453 }
    if (mapY < 45.425) { mapY = 45.415 }

    map.getView().setCenter(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'));

    if (map.getView().getZoom() < 14.5) {
      map.getView().setZoom(14.5)
      map.getView().setCenter(ol.proj.transform([centerX, centerY], 'EPSG:4326', 'EPSG:3857'));
    }
    if (map.getView().getZoom() > 21) {
      map.getView().setZoom(21)
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
  editButton.innerHTML = '<img src="./assets/pencil.png"/>'
  editButton.id = 'editButton'
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

    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Store Name:"
    content.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    nameInput.value = currInfo.store_name
    content.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function () { nameInput.value = "" }
    content.appendChild(clearName)
    content.appendChild(document.createElement("br"))

    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year Collected:"
    content.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    yearInput.value = currInfo.year_collected
    content.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    content.appendChild(clearYear)
    content.appendChild(document.createElement("br"))

    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Store Type:"
    content.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    for (let i = 0; i < storesOptions2.length; i++) {
      storeInput.add(storesOptions2[i])
    }
    storeInput.value = currInfo.store_type
    content.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function () { storeInput.value = "" }
    content.appendChild(clearStore)
    content.appendChild(document.createElement("br"))

    const noteLabel = document.createElement("label")
    noteLabel.setAttribute("for", "noteInput")
    noteLabel.innerText = "Note:"
    content.appendChild(noteLabel)
    const noteInput = document.createElement("input")
    noteInput.setAttribute("id", "noteInput")
    noteInput.setAttribute("name", "noteInput")
    noteInput.value = currInfo.note
    content.appendChild(noteInput)
    const clearNote = document.createElement("button")
    clearNote.innerText = "Clear"
    clearNote.onclick = function () { noteInput.value = "" }
    content.appendChild(clearNote)
    content.appendChild(document.createElement("br"))

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

    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("scrollButton")
    cancelButton.onclick = function () { setContent(pointInfo) }
    content.appendChild(cancelButton)

    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("scrollButton")
    submitButton.onclick = function () {
      if (isNaN(yearInput.value)) {
        alert("Year Collected must be a number")
      }
      else {
        loadingPopup()
        if (imageInput.files.length !== 0){
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
                            setFlagFilter()
                            setYearFilter()
                            setSestiereFilter()
                            setStoreFilter()
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
                    setFlagFilter()
                    setYearFilter()
                    setSestiereFilter()
                    setStoreFilter()
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
  content.appendChild(editButton)

  const plusButton = document.createElement("button")
  plusButton.innerHTML = '<img src="./assets/plus.png"/>'
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

    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Store Name:"
    content.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    nameInput.value = currInfo.store_name
    content.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function () { nameInput.value = "" }
    content.appendChild(clearName)
    content.appendChild(document.createElement("br"))

    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year Collected:"
    content.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    yearInput.value = new Date().getFullYear()
    content.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    content.appendChild(clearYear)
    content.appendChild(document.createElement("br"))

    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Store Type:"
    content.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    for (let i = 0; i < storesOptions2.length; i++) {
      storeInput.add(storesOptions2[i])
    }
    storeInput.value = currInfo.store_type
    content.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function () { storeInput.value = "" }
    content.appendChild(clearStore)
    content.appendChild(document.createElement("br"))

    const noteLabel = document.createElement("label")
    noteLabel.setAttribute("for", "noteInput")
    noteLabel.innerText = "Note:"
    content.appendChild(noteLabel)
    const noteInput = document.createElement("input")
    noteInput.setAttribute("id", "noteInput")
    noteInput.setAttribute("name", "noteInput")
    content.appendChild(noteInput)
    const clearNote = document.createElement("button")
    clearNote.innerText = "Clear"
    clearNote.onclick = function () { noteInput.value = "" }
    content.appendChild(clearNote)
    content.appendChild(document.createElement("br"))

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

    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("scrollButton")
    cancelButton.onclick = function () { setContent(pointInfo) }
    content.appendChild(cancelButton)

    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("scrollButton")
    submitButton.onclick = function () {
      if (imageInput.files.length === 0) {
        alert("Every data point must include a picture")
      }
      else if (isNaN(yearInput.value)) {
        alert("Year Collected must be a number")
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
                        setFlagFilter()
                        setYearFilter()
                        setSestiereFilter()
                        setStoreFilter()
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
  content.appendChild(plusButton)

  const deleteButton = document.createElement("button")
  deleteButton.innerHTML = '<img src="./assets/trash.png"/>'
  deleteButton.onclick = function () {
    loadingPopup()
    addedJSON = {
      _id: pointInfo._id,
      info: information,
      year: pointInfo.year_collected
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
              setFlagFilter()
              setYearFilter()
              setSestiereFilter()
              setStoreFilter()
              removePopup()
              return 0
            })
        })
        return 0
      })
  }
  content.appendChild(deleteButton)

  const displayedInfo = document.createElement("div")
  if (currInfo.store_name !== "") {
    displayedInfo.innerHTML = '<h1>' + currInfo.store_name + '</h1>'
      + '<h3>' + currInfo.address + '</h3>'
  }
  else {
    displayedInfo.innerHTML = '<h1>' + currInfo.address + '</h1>'
  }
  displayedInfo.innerHTML = displayedInfo.innerHTML
    + '<img src="' + currInfo.image_url + '" width="200px" height="200px">'
    + '<h4>' + currInfo.address_street + '</h4>'
    + '<h4>' + currInfo.store_type + '</h4>'
    + '<p>' + currInfo.note + '</p>'
  if (currInfo.flagged) {
    displayedInfo.innerHTML = displayedInfo.innerHTML + "<h1>Flagged</h1>"
  }
  displayedInfo.innerHTML = displayedInfo.innerHTML + "<h1>" + currInfo.year_collected + "</h1>"
  content.appendChild(displayedInfo)

  const pastButton = document.createElement("button");
  pastButton.innerText = "Previous Year";
  pastButton.classList.add('scrollButton');
  pastButton.onclick = function () {
    if (popupIndex > 0) {
      popupIndex = popupIndex - 1
    }
    setContent(pointInfo)
  }
  content.appendChild(pastButton)

  const futureButton = document.createElement("button");
  futureButton.innerText = "Next Year";
  futureButton.classList.add('scrollButton');
  futureButton.onclick = function () {
    if (popupIndex < information.length - 1) {
      popupIndex = popupIndex + 1
    }
    setContent(pointInfo)
  }
  content.appendChild(futureButton)
}

function gotoPosition(position){ 
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
  switch(error.code){
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
      navigator.geolocation.getCurrentPosition(gotoPosition,showError);
    }
    else{
      alert('Geolocation not supported')
    }
  }
}

function setAddLocation() {
  const addLocation = document.querySelector('#addLocation')
  addLocation.onclick = function () {
    overlay.setOffset([-200, -300])
    overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))

    content.innerHTML = ""

    const streetLabel = document.createElement("label")
    streetLabel.setAttribute("for", "streetInput")
    streetLabel.innerText = "Street: "
    content.appendChild(streetLabel)
    const streetInput = document.createElement("input")
    streetInput.setAttribute("id", "streetInput")
    streetInput.setAttribute("name", "streetInput")
    content.appendChild(streetInput)
    const clearStreet = document.createElement("button")
    clearStreet.innerText = "Clear"
    clearStreet.onclick = function () { streetInput.value = "" }
    content.appendChild(clearStreet)
    content.appendChild(document.createElement("br"))

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

    const numberLabel = document.createElement("label")
    numberLabel.setAttribute("for", "numberInput")
    numberLabel.innerText = "Number: "
    content.appendChild(numberLabel)
    const numberInput = document.createElement("input")
    numberInput.setAttribute("id", "numberInput")
    numberInput.setAttribute("name", "numberInput")
    content.appendChild(numberInput)
    const clearNumber = document.createElement("button")
    clearNumber.innerText = "Clear"
    clearNumber.onclick = function () { numberInput.value = "" }
    content.appendChild(clearNumber)
    content.appendChild(document.createElement("br"))

    const latLabel = document.createElement("label")
    latLabel.setAttribute("for", "latInput")
    latLabel.innerText = "Latitude: "
    content.appendChild(latLabel)
    const latInput = document.createElement("input")
    latInput.setAttribute("id", "latInput")
    latInput.setAttribute("name", "latInput")
    content.appendChild(latInput)
    const clearLat = document.createElement("button")
    clearLat.innerText = "Clear"
    clearLat.onclick = function () { latInput.value = "" }
    content.appendChild(clearLat)
    content.appendChild(document.createElement("br"))

    const lngLabel = document.createElement("label")
    lngLabel.setAttribute("for", "lngInput")
    lngLabel.innerText = "Longitude: "
    content.appendChild(lngLabel)
    const lngInput = document.createElement("input")
    lngInput.setAttribute("id", "lngInput")
    lngInput.setAttribute("name", "lngInput")
    content.appendChild(lngInput)
    const clearLng = document.createElement("button")
    clearLng.innerText = "Clear"
    clearLng.onclick = function () { lngInput.value = "" }
    content.appendChild(clearLng)
    content.appendChild(document.createElement("br"))

    const findCoords = document.createElement("button")
    findCoords.innerText = "Find Coordinates"
    findCoords.classList.add("scrollButton")
    findCoords.onclick = function () {
      removePopup()

      alert("Click a location to set the coordinates of the new store")

      map.on('singleclick', function (event) {
        const coords = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
        latInput.value = coords[1]
        lngInput.value = coords[0]

        map.on('singleclick', function (event) {
          if (map.hasFeatureAtPixel(event.pixel) === true) {
            let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
            popupIndex = pointInfo.info.length - 1
            setContent(pointInfo)

            overlay.setOffset([-200, -300])
            overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
          } else {
            removePopup()
          }
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

    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Store Name:"
    content.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    content.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function () { nameInput.value = "" }
    content.appendChild(clearName)
    content.appendChild(document.createElement("br"))

    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year Collected:"
    content.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    yearInput.value = new Date().getFullYear()
    content.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function () { yearInput.value = "" }
    content.appendChild(clearYear)
    content.appendChild(document.createElement("br"))

    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Store Type:"
    content.appendChild(storeLabel)
    const storeInput = document.createElement("select")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    for (let i = 0; i < storesOptions2.length; i++) {
      storeInput.add(storesOptions2[i])
    }
    content.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function () { storeInput.value = "" }
    content.appendChild(clearStore)
    content.appendChild(document.createElement("br"))

    const noteLabel = document.createElement("label")
    noteLabel.setAttribute("for", "noteInput")
    noteLabel.innerText = "Note:"
    content.appendChild(noteLabel)
    const noteInput = document.createElement("input")
    noteInput.setAttribute("id", "noteInput")
    noteInput.setAttribute("name", "noteInput")
    content.appendChild(noteInput)
    const clearNote = document.createElement("button")
    clearNote.innerText = "Clear"
    clearNote.onclick = function () { noteInput.value = "" }
    content.appendChild(clearNote)
    content.appendChild(document.createElement("br"))

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
    cancelButton.onclick = function () {
      removePopup()
    }
    content.appendChild(cancelButton)

    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("scrollButton")
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
                          setFlagFilter()
                          setYearFilter()
                          setSestiereFilter()
                          setStoreFilter()
                          removePopup()
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

function setFlagFilter() {
  const flagFilter = document.querySelector('#flagFilter')
  flagFilter.innerHTML = '<br><input type="checkbox" id="flaggedbox">'
    + '<label for="flaggedbox">Flagged</label>'

  const flaggedBox = document.querySelector('#flaggedbox')
  flaggedBox.addEventListener("change", filterFeatures)
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
  });
}

function filterFeatures(e) {
  removePopup()
  e.preventDefault()

  const yearSelecting = document.querySelector('#yearSelect')
  yearTargets = []
  for (let i = 0; i < yearSelecting.selectedOptions.length; i++){
    yearTargets.push(yearSelecting.selectedOptions[i].value)
  }

  const sestiereSelecting = document.querySelector('#sestiereSelect')
  sestiereTargets = []
  for (let i = 0; i < sestiereSelecting.selectedOptions.length; i++){
    sestiereTargets.push(sestiereSelecting.selectedOptions[i].value)
  }

  const storeSelecting = document.querySelector('#storeSelect')
  storeTargets = []
  for (let i = 0; i < storeSelecting.selectedOptions.length; i++){
    storeTargets.push(storeSelecting.selectedOptions[i].value)
  }

  data = JSON.parse(JSON.stringify(dataAll))
  
  let flagged = document.querySelector('#flaggedbox')
  if (flagged.checked) {
    for (let i = 0; i < data.length; i++) {
      data[i].info2 = data[i].info2.filter(item => item.flagged)
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
  }
  if (storeTargets.length !== 0) {
    for (let i = 0; i < data.length; i++) {
      data[i].info2 = data[i].info2.filter(item => storeTargets.includes(item.store_type))
    }
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
        setBaselines()
        setFeatures()
        setPopup()
        addLayer()
        setGoToLocation()
        setAddLocation()
        setFlagFilter()
        setYearFilter()
        setSestiereFilter()
        setStoreFilter()
        return 0
      })
  })
}