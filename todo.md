# TODO

- [x] Create card to display lots. Card should be autotrader layout and style.
- [x] Add zustand state management to control data passed from search component to result. There will be more state like user or app settings so centralized state management is necessary.
- [x] Add quick filter buttons to filter and sort horizontal component.
- [x] Add selectOne function to checkBox component for search filter which need to select only one option.
- [x] update naming to follow conventions.
- [x] Improve performance by adding useCallback and useMemo
- [x] Add onClick to lot card so on click it should open new page with detailed info of the single lot.
- [x] Add database for scraped lots
- [ ] CHANGE NAME TO "IMPORTEK" (That's only for Polish market.)
- [ ] Add tokens to endpoints to authorise requests.
- [x] Scraper page pagination.
- [x] Add scraping data to db.
- [ ] Remove month and year form data base as it wont be used. Each sale list has own date and time which will be used to
    assign to right calendar day in calendar component.
- [ ] Flow for creating and updating database entries.

        Phase I
        Creation of the data base
        - Create data base object with _id, scrapedAt (it can be changed to createdAt), totalAuctions, auctions. I think there can be added few other key value elements to this document but at the moment lets keep it as it is.
        - Download csv file, convert it into lotDetails object and save it to data base
        - Scrape images for every lot and update lotDetails images.copart database field.

        Phase II
        Updating Database.
        - Download csv file, convert it into lotDetails object and compare it to existing saved in database. In case of additional lots or new lots add them to saleList and in case of different values in existing lotDetails database entries update them.
        
- [ ]  Add at lest 5 extra login credentials email/password and rotate credentials with rotating ip on every login to reduce possibility of being banned.
- [ ] Stats component for the calendar to show how many auctions are for selected day with data of the lots for sale.
    *number of sales
    *number of lots for sale
    *number buy it now

- [x] Add check for duplicates sales to avoid saving same sale lists twice.
- [x] Create check for duplicates sales lists in the fetchAllSaleLists route.
- [x] Fix the bug of the old sales from May added to current sale. It was caused by LIVE NOW check and addition of todays date even for old sales which where scraped at that time and never updated.
- [ ] Add sync for 'Next Sale' for sales scraped without it. At the moment scraper gets some sales without "Next Sales" and then never up date it when copart adds them to calendar. On every scrape it should be checked compared and updated.
