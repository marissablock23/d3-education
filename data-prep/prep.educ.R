library(tidyverse)
library(readxl)
library(here)
library(jsonlite)
library(fuzzyjoin)



### Clean Data

# WDI
wdi <- read_csv("data/clean.wdi.csv")
  
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
    
# ILO Stats
   labor <- read_xlsx("data/IL_Emp_Educ.xlsx", sheet = "MBI_11_EN",
                      na = "", skip = 5)
   labor <- labor %>% rename("country" = `Reference area`, "source" = `Source type`, "year" = "Time", "less" = "Less than basic..13",
                             "basic" = "Basic..14", "intermediate" = "Intermediate..15", "advanced" = "Advanced..16", 
                             "not" = "Level not stated..17") %>% select(country, source, Sex, Age, year, less, basic, intermediate,
                                                                       advanced, not)
   # Make year variable factor
   labor$year <- as.factor(labor$year)
   

#################### Check for consistency in country names ####################
returns.country <- returns %>%
                    select(country, year) %>%
                    group_by(country) %>%
                    filter(year == max(year)) %>%
                    unique()

wdi.country <- wdi %>%
                select(country, inc.grp, Region) %>%
                unique()

check <- wdi.country %>%
  full_join(returns.country) %>%
  rename(returns = "year") %>%
  mutate(returns = if_else(is.na(returns), 0, 1)) %>%
  write_csv(path = "data/check.csv")

## Make name changes

wdi$country[wdi$country == "Bahamas, The"] <- "Bahamas"
wdi$country[wdi$country == "Bosnia and Herzegovina"] <- "Bosnia & Herzegovina"
wdi$country[wdi$country == "Egypt, Arab Rep."] <- "Egypt"
wdi$country[wdi$country == "Gambia, The"] <- "The Gambia"
returns$country[returns$country == "Gambia"] <- "The Gambia"
wdi$country[wdi$country == "Hong Kong SAR, China"] <- "Hong Kong"
wdi$country[wdi$country == "Iran, Islamic Rep."] <- "Iran"
wdi$country[wdi$country == "Korea, Rep."] <- "South Korea"
returns$country[returns$country == "Korea"] <- "South Korea"
returns$country[returns$country == "Kyrgyzstan"] <- "Kyrgyz Republic"
wdi$country[wdi$country == "Russian Federation"] <- "Russia"
returns$country[returns$country == "Slovakia"] <- "Slovak Republic"
returns$country[returns$country == "United States of America"] <- "United States"
wdi$country[wdi$country == "Venezuela, RB"] <- "Venezuela"
wdi$country[wdi$country == "Yemen, Rep."] <- "Yemen"
returns$country[returns$country == "Palestine"] <- "West Bank and Gaza"


edstats$country[edstats$country == "Bahamas, The"] <- "Bahamas"
edstats$country[edstats$country == "Bosnia and Herzegovina"] <- "Bosnia & Herzegovina"
edstats$country[edstats$country == "Egypt, Arab Rep."] <- "Egypt"
edstats$country[edstats$country == "Gambia, The"] <- "The Gambia"
edstats$country[edstats$country == "Hong Kong SAR, China"] <- "Hong Kong"
edstats$country[edstats$country == "Iran, Islamic Rep."] <- "Iran"
edstats$country[edstats$country == "Korea, Rep."] <- "South Korea"
edstats$country[edstats$country == "Russian Federation"] <- "Russia"
edstats$country[edstats$country == "Venezuela, RB"] <- "Venezuela"
edstats$country[edstats$country == "Yemen, Rep."] <- "Yemen"


# Remove Yugoslavia from returns
returns <- filter(returns, country!= "Yugoslavia")


remove(check, wdi.country, returns.country)



############################################################
   
##################### EXPORT DATA ##########################

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

###### EXPORT DIRECTLY TO FOLDER WHERE D3 PULLS DATA

  ## Benchmarking
      # Filter to 2010 years of schooling
      yrs <- edstats %>%
        filter(year==2010) %>%
        select(country, bar.schl.15up)
      # Filter to 2017 for harmonized test scores
      test <- edstats %>%
        filter(year==2017) %>%
        select(country, hd.hci.hlos)

      # Merge data above with GDP + take log of gdp
      wdi %>%
        filter(year==2017) %>%
        left_join(yrs) %>%
        left_join(test) %>%
        select(country, bar.schl.15up, ny.gdp.pcap.kd, cntry.code, hd.hci.hlos, inc.grp, Region) %>%
        rename(gdp = "ny.gdp.pcap.kd", cntrycode = "cntry.code", yrs = "bar.schl.15up", score = "hd.hci.hlos",
               incgrp = "inc.grp") %>%
        select(country, yrs, gdp, cntrycode, score, incgrp, Region) %>%
        mutate(gdp = log(gdp)) %>%
        write_csv(path = "../data/bench.csv")
      
  ## Test 1
    # Returns to schooling
      write_csv(returns, path = "../data/returns.csv")
      
###################### FUNCTION ATTEMPT ###################### 
disaggregate <- function(df, source, name, global, value) {
    df %>%
    group_by(country) %>%
    filter(!is.na(name)) %>%
    filter(year == max(year)) %>%
    rename(year.return = "year", source = "source") %>%
    select(country, year.return, name, source) %>%
    mutate(global = value)
}

returns.ovr <- disaggregate(returns, source.ovr, overall, globalAvgOverall, 9)
###############################################################

# Create separate data frames of the most recent year of data available for each 
# category: overall, primary, secondary, higher, male, and female. Include the global average.
# Then, merge all together.
  
  # Overall      
      returns.ovr <- returns %>%
        group_by(country) %>%
        filter(!is.na(overall)) %>%
        filter(year == max(year)) %>%
        rename(year.return = "year", source.ovr = "source") %>%
        select(country, year.return, overall, source.ovr)
        #mutate(`Overall Average` = 8.8)
  
  # Primary   
      returns.prim <- returns %>%
        group_by(country) %>%
        filter(!is.na(primary)) %>%
        filter(year == max(year)) %>%
        rename(year.return = "year", source.prim = "source") %>%
        select(country, year.return, primary, source.prim)
        #mutate(`Primary Average` = 7.8)

  # Secondary      
      returns.sec <- returns %>%
        group_by(country) %>%
        filter(!is.na(secondary)) %>%
        filter(year == max(year)) %>%
        rename(year.return = "year", source.sec = "source") %>%
        select(country, year.return, secondary, source.sec)
        #mutate(`Secondary Average` = 10.5)

  # Higher      
      returns.high <- returns %>%
        group_by(country) %>%
        filter(!is.na(higher)) %>%
        filter(year == max(year)) %>%
        rename(year.return = "year", source.high = "source") %>%
        select(country, year.return, higher, source.high)
        #mutate(`Higher Average` = 12.9)

  # Male      
      returns.male <- returns %>%
        group_by(country) %>%
        filter(!is.na(male)) %>%
        filter(year == max(year)) %>%
        rename(year.return = "year", source.male = "source") %>%
        select(country, year.return, male, source.male)
        #mutate(`Male Average` = 7.9)

  # Female     
      returns.female <- returns %>%
        group_by(country) %>%
        filter(!is.na(female)) %>%
        filter(year == max(year)) %>%
        rename(year.return = "year", source.female = "source") %>%
        select(country, year.return, female, source.female)
        #mutate(`Female Average` = 9.6)
 
  # Merge 
      merge <- returns.ovr %>%
        full_join(returns.prim) %>%
        full_join(returns.sec) %>%
        full_join(returns.high) %>%
        full_join(returns.male) %>%
        full_join(returns.female) %>%
        gather("overall", "primary", "secondary", "higher", "male", "female", key = "type", value = "value") %>%
        gather("source.ovr", "source.prim", "source.sec", "source.high", "source.male", "source.female", key = "source.type", value = "source") %>%
        rename(year = "year.return") %>%
        arrange(country, year) %>%
        filter(!is.na(value)) %>%
        filter(!is.na(source)) %>%
        select(-source.type) %>%
        unique() %>%
        write_csv(path = "../data/returns2.csv")
      
  

  