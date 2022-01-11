The Venice Shops application is built in Javascript and is currently being hosted at https://venice-shops.herokuapp.com.  It uses the express framework and the dependencies are express, express-fileupload, fs, googleapis, mongodb, ol, select-pure, and serve-favicon.  

USE: The process of using the application can be found in our Application Instruction Manual, which is linked on our website (https://sites.google.com/view/wpivenicestopsdata).  

LOCATION: The code can be found at https://github.com/srdpt/VeniceShops 

MAINTENANCE: The email for the Heroku account is venice.wpi@gmail.com and the password is xazNib-6jyfbe-sykxuc.  The email for the MongoDB account containing the data is ve21.covid@gmail.com and the password is kacsyb-9bujkE-jebfuv.  To make additions and modifications to the code, fork the VeniceShops repo and work from there.  To publish the site, follow https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment, which will allow changes to be made and pushed while the app is live.  Comments can be found in the code to explain the functionality and facilitate future additions and modifications.  The features of the application and our suggestions for future improvements are as follows: 

Features:
Past Stores
    Imported all shops data into MongoDB
    Categorized the 100+ store types into 10 groupings (Clothing, …
Map Rendering
    Displays a map of Venice
    Can display collected stores (as map points/circles) from all 8 years (default)
    Can display the Airbnb locations (as map points) for any combination of years in the range 2009-2020
    Can geolocate the user on the map with the GPS button (assuming they are in Venice and using the app on a GPS enabled device)
    Can reset the map to the default view with the Home button
    Hovering/mouse over a store point displays the store name (or sestiere and number, if no name is available)
    Clicking on a store point opens the store details in a popup
    Can resize the store points from small (default) to large (and vice versa) by toggling the resize button
    Color coding
Map Navigation
    Can zoom in/out on map using either pinch to zoom or the +/- buttons
    Can pan the map by dragging it up/down/left/right 
    Can turn/re-orient the map by dragging rotationally
    Can reset the map to the default orientation by clicking the Reset Orientation button
    Can reset the map to the default size/orientation/location by clicking the Home button
Filter
    Can filter by Stores
    Can filter by Airbnb
    Can filter by Year Collected
    Can filter by Sestiere
    Can filter by Shop Type
    Can filter by Flagged stores
    Can filter by Unflagged stores
    Can filter by Open stores
    Can filter by Tourist stores
    Can filter by Resident stores
    Can filter by Mixed stores
    Displays the number of stores returned (for the current filter settings)
    Displays the number of Airbnbs returned 
Timelapse
    Can cycle through the years for the current filter settings, by clicking on the Cycle Years button
        The cycle year will display under the button
        The store and/or Airbnb points will display for each cycle year
        The store and Airbnb counts will display for each cycle year
    Can pause/resume the year cycling by clicking the Pause/Resume Cycling button
    Can end the year cycling by clicking the End Cycling button
Data Collection
    To edit a previously collected store, click on its map point to open the store detail
        Can mark the store for deletion by clicking the Trash/Delete icon
        Can edit that year’s store detail by clicking the Pencil/Edit icon
            Can select a photo to submit by clicking the Choose File button
            If the store entry has an associated image, the photo will display (can click on a store’s          associated image to open a larger version)
            Can edit the store’s Name, Year, Store Type and Note
            Can clear the store’s Name, Year, and Note by clicking the corresponding Clear buttons
            Can set the store’s Type to Closed by clicking the corresponding Clear button
            Can mark the store as Flagged by checking the ‘Flagged’ checkbox
            Can cancel all edits by selecting the Cancel button
            Can cancel all edits and close the popup by clicking anywhere on the map
            Can save all edits by selecting the Submit button (user prevented from submitting a store that doesn’t have a year, or a flagged store that doesn’t have a Note)
        Can define a new store for that address by clicking the +/New button
            Can select an image to submit by clicking the Choose File button 
            Can add the store’s Name, Store Type and Note (the Store Year will default to the current year)
            Can clear the store’s Name, Year, and Note by clicking the corresponding Clear buttons
            Can set the store’s Type to Closed by clicking the corresponding Clear button
            Can mark the store as Flagged by checking the ‘Flagged’ checkbox
            Can cancel the addition of the store by selecting the Cancel button
            Can cancel addition of the store and close the popup by clicking anywhere on the map
            Can add the new store to the database by selecting the Submit button (user will be prevented from submitting a new store that doesn’t have a year or a photo, or a flagged store that doesn’t have a Note)
        Can navigate to previous year’s entries (if collected) by clicking the Previous Entry button
        Can navigate to next year’s entries (if collected) by clicking the Next Entry button
        When there is no previous (or next) entry, the Previous (or Next) Entry button will be disabled
    To add a store at a new address, click the +/New button on the top right toolbar
        Can select the store’s sestiere with the Sestiere dropdown
        Can select an image to submit by clicking the Choose File button 
        Can add the store’s Street, Number, Latitude, Longitude, Name, Store Type and Note (the Store Year will default to the current year)
        Can clear the store’s Street, Number, Latitude, Longitude, Name, Year, and Note by clicking the corresponding Clear buttons
        Can automatically complete the Latitude and Longitude inputs by pressing the Find Coordinates button    (user selects a location on the map and the corresponding coordinates are entered into the Latitude and Longitude inputs)
        Can set the store’s Type to Closed by clicking the corresponding Clear button
        Can mark the store as Flagged by checking the ‘Flagged’ checkbox
        Can cancel the addition of the store by selecting the Cancel button
        Can cancel addition of the store and close the popup by clicking anywhere on the map
        Can add the new store to the database by selecting the Submit button (user will be prevented from submitting a new store that doesn’t have number, a latitude, and longitude, year, or a photo, or a flagged store that doesn’t have a Note)
Settings/Download
    Can manage the mapping of each store type to Tourist, Resident, or Mixed Use with the Settings button (changes made through the settings button are persistent and global)
    Can download the data for all stores returned in the filter set (i.e. all visible store points on the map)
    Download is a CSV file, with a row for each (instance of a) store and a series of calculated columns designed to facilitate analysis

Suggestions:
Localization - add the ability to switch text labels from English to Italian (& back). E.g. https://lokalise.com/blog/json-l10n/
Map - replace the circle re-sizer with a range slider control (https://www.w3schools.com › howto_js_rangeslider)
Database - migrate the data in MongoDB to a more centralized account (download the data, create a new MongoDB account [maybe with venice.wpi@gmail.com], put the data into the new account, replace the references to the database in the code to reflect the change)
Data - find data from 2019 team and integrate into the database
Data - find pictures from data points from previous years and add them to their associated entries (many of the images can be found on our website)
Data - write script to run through the shops data and combine the ‘info’ arrays for all data points with the same address and very similar coordinates (there are many data points, specifically from 2015, that should be included in pre established locations but were instead included as separate locations with the same coordinates)
Data - standardize the structure of the Google Drive photo directory (move to a more secure location, divide images into separate folders for years and subfolders for sestiere)
Data - address all flagged entries
Login - Implement authentication/authorization
UI - modify the popups such that the cancel and submit buttons can only be seen when the popup is scrolled accordingly (take advantage of the min-height css property)
UI - add a key to explain the meaning of the colors of the dots (color mappings are determined by the ‘colors’ variable in public/js/scripts.js)
Store Detail - Add support for navigating to the store with the next/previous address number from the detail popup
Store Detail - Add support for multiple photos/gallery (having a photo of store interior thru window could be help verify store type)
Store Detail - Modify the detail display to show the entry that corresponds to the most recent applicable year in the filters rather than the most recent year in general (if a store has entries in 2004, 2015, and 2021 and the 2015 filter is applied, the popup will display the 2021 entry when the circle is clicked when it should instead show the 2015 entry)
Store Detail - Add support for editing the address and location of locations
Store Detail - Add ability to open detail popup of a specified store through a queries in a search bar
DC - Add support for a data collection (DC) mode (accessed through the login functionality); 
    Add support to open the store detail window by specifying its District Number (assuming it was previously collected)
    Make app mobile device friendly, better touch support (for low resolution finger input)
    Make map refreshes remember the current filter selections
    Make the map geo-locate the user’s position on the map and orients map in direction of travel
DC - Add support for off-line data collection (when signal drops/unavailable). Spool submissions to a file and upload when connection is restored.
DC - Capture the collector's name/id in the database
Timelapse - Option to step forward or backward a year in Timelapse mode (like in a debugger)
Filter - Add ability to search Notes (from the Filter pane)
Filter - Add ability to search by District Number
Filter - Add ability to filter by entries with images
Admin - Add an Administrator page (restricted access)
    Add support to CRUD (Create, Read, Update, Delete) User Accounts 
    Add support for User Management: Roles (e.g. admin, data collector, end user) & user-role association
    Add support to manage stores marked as delete/archive (actual delete or remove marked as delete/archive flag)
    Add support to update store details in a list view
    Add support to execute predefined Reports, and display the results 
    Add support to CRUD custom Reports
    Add support to CRUD group-category mappings
    Add support to CRUD text label localization
    Add support to “skin” the application (i.e. customize the look and feel)
    Add support for map association (map configuration)
    Add support for map boundaries (map configuration)
Misc - Recategorize the ‘Radio and Television’ type, recategorize or remove the ‘Stall’ type
Misc - Address data points with type ‘Undefined’
