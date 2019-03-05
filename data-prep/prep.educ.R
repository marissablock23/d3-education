library(tidyverse)
library(readxl)
library(here)
library(jsonlite)



### Clean Data

# WDI
wdi <- read_csv("../fininc-data/clean/clean.wdi.csv")
  
  # Rename variables
  wdi <- rename(wdi, country = "country.x")

  
# WDI - Time Series (2004 - 2018)
wdi.time <- read_csv("data/wdi_timeseries.csv", na = "..",
                     col_types = cols(
                       `2004 [YR2004]` = col_number()
                     ))
  # Drop last 5 rows
  wdi.time <- head(wdi.time, -5)
  
  # Rename variables
  wdi.time <- rename(wdi.time, country = "Country Name", cntry.code = "Country Code")
  
  # Reshape year variables to column
  wdi.time <- wdi.time %>%
    gather(`2004 [YR2004]`, `2005 [YR2005]`, `2006 [YR2006]`, `2007 [YR2007]`, `2008 [YR2008]`, `2009 [YR2009]`, `2010 [YR2010]`,
           `2011 [YR2011]`, `2012 [YR2012]`, `2013 [YR2013]`, `2014 [YR2014]`, `2015 [YR2015]`, `2016 [YR2016]`, `2017 [YR2017]`,
           key = year, value = value)
  
  # Drop Series Name
  wdi.time <- select(wdi.time, -`Series Name`)
  
  # Reshape Series Code column to variables
  wdi.time <- wdi.time %>%
    spread(key = `Series Code`, value = value)
  
  # Drop variables with all NAs
  wdi.time <- wdi.time[, colSums(is.na(wdi.time)) != nrow(wdi.time)]
  
  # Make year variable factor
  wdi.time$year <- str_sub(wdi.time$year, 1, 4)
  wdi.time$year <- as.factor(wdi.time$year)
  
  # Make variables names lowercase
  colnames(wdi.time) <- tolower(colnames(wdi.time))

  
  
  

# Returns to schooling
returns <- read_xlsx("data/ReturnsEdAnnex2.xlsx", sheet = "Sheet 1",
                     na = "", skip = 7)
    # Rename variables
    returns <- returns %>%
      rename("country" = "..1", "year"= "..2", "Region" = "..3", "inc" = "..4", "yrs.sch" = "..5", "overall" = "..6", "primary" = "Prim..7", "secondary" = "Sec..8", "higher" = "Higher..9", "primary.soc" = "Prim..13", "secondary.soc" = "Sec..14", "higher.soc" = "Higher..15", "male" = "Males", "female" = "Females", "private" = "Private", "public" = "Public", "source" = "See Annex 3")
    # Ignore full discounting, private for now
    
    # Remove first row
    returns <- returns[-1,]

# World Bank Ed Stats
edstats <- read_csv("data/wb_edstats.csv", na = "..",
                    col_types = cols(
                      `2007 [YR2007]` = col_number() 
                    ))

    # Drop last 5 rows
    edstats <- head(edstats, -5)
    
    # Rename variables
    edstats <- rename(edstats, country = "Country Name", cntry.code = "Country Code")
    
    # Reshape year variables to column
    edstats <- edstats %>%
      gather(`2007 [YR2007]`, `2008 [YR2008]`, `2009 [YR2009]`, `2010 [YR2010]`, `2011 [YR2011]`, `2012 [YR2012]`,
             `2013 [YR2013]`, `2014 [YR2014]`, `2015 [YR2015]`, `2016 [YR2016]`, `2017 [YR2017]`,
             key = year, value = value)
    
    # Drop Series Name
    edstats <- select(edstats, -`Series`)
    
    # Reshape Series Code column to variables
    edstats <- edstats %>%
      spread(key = `Series Code`, value = value)
    
    # Make year variable factor
    edstats$year <- str_sub(edstats$year, 1, 4)
    edstats$year <- as.numeric(edstats$year)

    # Make variables names lowercase
    colnames(edstats) <- tolower(colnames(edstats))
    
    # Remember that aggregates and regions are included as countries
    
  
      
### Export as JSON

  # Reverse Scatter Plot: GDP vs. Adult Literacy Rate, 2015
    # Countries where literacy rate is not missing
    wdi %>%
      filter(year==2015) %>%
      select(country, litrate = "se.adt.litr.zs", gdp = "ny.gdp.pcap.kd", Region) %>%
      filter(!is.na(litrate)) %>%
      filter(!is.na(gdp)) %>%
      ggplot() +
      geom_point(aes(x = log(gdp), y = litrate))
      
      
      toJSON(pretty=TRUE) %>%
      write_json(path = "wdi.json")
  
  ## Benchmarking
    # Quantity of Schooling
      # Filter to 2010 years of schooling
      yrs <- edstats %>%
        filter(year==2010) %>%
        select(country, bar.schl.15up)
      # Filter to 2017 for harmonized test scores
      test <- edstats %>%
        filter(year==2017) %>%
        select(country, hd.hci.hlos)
      
      wdi %>%
        filter(year==2017) %>%
        left_join(yrs) %>%
        select(country, bar.schl.15up, ny.gdp.pcap.kd, cntry.code) %>%
        rename(gdp = "ny.gdp.pcap.kd", cntrycode = "cntry.code", yrs = "bar.schl.15up") %>%
        #write_json(path = "yrs.json")
        filter(!is.na(gdp)) %>%
        filter(!is.na(yrs)) %>%
        write_csv(path = "data/clean/bench.q.csv")

      wdi %>%
        filter(year==2017) %>%
        left_join(yrs) %>%
        left_join(test) %>%
        select(country, bar.schl.15up, ny.gdp.pcap.kd, cntry.code, hd.hci.hlos) %>%
        rename(gdp = "ny.gdp.pcap.kd", cntrycode = "cntry.code", yrs = "bar.schl.15up", score = "hd.hci.hlos") %>%
        full_join(returns, by = "country") %>%
        select(country, bar.schl.15up, ny.gdp.pcap.kd, cntry.code, hd.hci.hlos)
        #write_json(path = "yrs.json")
        #filter(!is.na(gdp)) %>%
        #filter(!is.na(yrs)) %>%
        write_csv(path = "data/clean/bench.csv")
      
  ## Test 1
    # Returns to schooling
      write_csv(returns, path = "data/clean/returns.csv")
      
    
  ## Test 2
    # Changes in GDP growth vs. Changes in Secondary School Enrollment Rates
      SE.SEC.ENRR
      NY.GDP.MKTP.KD.ZG
      
      wdi.time %>%
        group_by(country) %>%
        mutate(secGrowth = (se.sec.enrr - lag(se.sec.enrr))/lag(se.sec.enrr)) %>%
        filter(country=="Albania") %>%
        ggplot(aes(x = ny.gdp.pcap.kd.zg, y = secGrowth, label = year)) +
          geom_point() +
          geom_label(aes(label = year)) +
          geom_segment(aes(xend=c(tail(ny.gdp.pcap.kd.zg, n = -1), NA),
                           yend=c(tail(secGrowth, n = -1), NA)),
                       arrow = arrow(length=unit(0.3, "cm")))
      
      
      
  
  
  