---
layout: post
title: Collecting Covid data from Johns Hopkins University
subtitle: Code samples
cover-img: 
thumbnail-img: 
share-img: 
tags: 
comments: false
---

The two Python scripts below pull data from the Johns Hopkins Github page and online dashboard as part of the Coronavirus database I have been maintaining since April of 2020.

Sensitive information, such as passwords and credentials, has been removed and replaced with REDACTED.

### Script 1: Historical data from the Hopkins Github repository
This script pulls data from the [Johns Hopkins University GitHub repository](https://github.com/CSSEGISandData/COVID-19). New case and death data is updated there nightly and provided in time series format dating back to the start of the pandemic.

The code takes the cumulative totals provided by Hopkins and calculates the number of daily new cases and deaths for countries and U.S. states, along with seven-day averages of each. It then pushes the data to a Google Sheets database.

```python
import pandas as pd
import requests
import numpy as np
import datetime
import io
import gspread
import df2gspread as d2g
from df2gspread import df2gspread as d2g
from df2gspread import gspread2df as g2d
from oauth2client.service_account import ServiceAccountCredentials
import sys
from pytz import timezone
import time
import smtplib
from time import sleep
from pandas import ExcelWriter
import traceback


# Load email credentials and some additional details for error handling and alerts
gmail_user = REDACTED
gmail_password = REDACTED

sent_from = REDACTED
to = REDACTED
subject = 'Alert Alert Alert'
body = 'There was an alert activated on the JHU time series script. Check PythonAnywhere logs for more details.'

email_text = """From: %s
To: %s
Subject: %s
%s
""" % (sent_from, ", ".join(to), subject, body)


## Set values for time string to update the ReadMe page and use in excel file URL
tz = timezone('US/Eastern')
start_time = datetime.datetime.now(tz)
now_pretty = start_time.strftime("%B %d, %Y, %H:%M:%S")
now_string = str(start_time).replace(' ','-').replace('.','-').replace(':','-')

print(now_pretty)
print(now_string)


us_cases_url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'
us_deaths_url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv'

global_cases_url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'
global_deaths_url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'


# Check status for the JHU Github page
def check_status(r_sheet):
    loop_var = 0
    max_tries = 3
    while r_sheet.status_code != 200:
        loop_var += 1
        print('Looped ' + str(loop_var) + ' times.')
        sleep(6)
        if loop_var == max_tries:
            try:
                body = 'Github request failed. Did not receive response code 200.'
                print('Github request failed. Sending the alert email.')
                server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
                server.ehlo()
                server.login(gmail_user, gmail_password)
                server.sendmail(sent_from, to, email_text)
                server.close()
                print('Sent the alert email about Github request fail.')
            except:
                print('Problem sending email about the Github request failure.')
            finally:
                print('Exiting the program following the Github request.')
                sys.exit()
    print('Response for time series data on Github: ' + str(r_sheet.status_code) + '. Good to go!')


r_us_cases = requests.get(us_cases_url) #Make the request - us cases
check_status(r_us_cases)
r_us_cases = r_us_cases.text #Get the text of the request - us cases

r_us_deaths = requests.get(us_deaths_url) #Make the request - us deaths
check_status(r_us_deaths)
r_us_deaths = r_us_deaths.text #Get text of the request - us deaths

r_global_cases = requests.get(global_cases_url) #Make the request - global cases
check_status(r_global_cases)
r_global_cases = r_global_cases.text #Get the text of the request - global cases

r_global_deaths = requests.get(global_deaths_url) #Make the request - us deaths
check_status(r_global_deaths)
r_global_deaths = r_global_deaths.text #Get text of the request - us deaths


us_cases_data = pd.read_csv(io.StringIO(r_us_cases)) #Read the request string as a csv - us cases
us_deaths_data = pd.read_csv(io.StringIO(r_us_deaths)) #Read the request string as a csv - us deaths

global_cases_data = pd.read_csv(io.StringIO(r_global_cases)) #Read the request string as a csv - us cases
global_deaths_data = pd.read_csv(io.StringIO(r_global_deaths)) #Read the request string as a csv - us deaths



#Group by Country/Region
grouped_us_cases = us_cases_data.groupby('Province_State').sum().sort_values('Province_State', ascending=True).reset_index()
us_cases = grouped_us_cases.drop(['UID','code3','FIPS','Lat','Long_'], axis=1)

grouped_us_deaths = us_deaths_data.groupby('Province_State').sum().sort_values('Province_State', ascending=True).reset_index()
us_deaths = grouped_us_deaths.drop(['UID','code3','FIPS','Lat','Long_','Population'], axis=1)

grouped_global_cases = global_cases_data.groupby('Country/Region').sum().sort_values('Country/Region', ascending=True).reset_index()
global_cases = grouped_global_cases.drop(['Lat','Long'], axis=1)

grouped_global_deaths = global_deaths_data.groupby('Country/Region').sum().sort_values('Country/Region', ascending=True).reset_index()
global_deaths = grouped_global_deaths.drop(['Lat','Long'], axis=1)



#Reshape data from wide to long
long_us_cases = pd.melt(us_cases, id_vars=['Province_State'], var_name='date', value_name='cases')
long_us_deaths = pd.melt(us_deaths, id_vars=['Province_State'], var_name='date', value_name='deaths')

long_global_cases = pd.melt(global_cases, id_vars=['Country/Region'], var_name='date', value_name='cases')
long_global_deaths = pd.melt(global_deaths, id_vars=['Country/Region'], var_name='date', value_name='deaths')



#Convert date column from string to datetime
long_us_cases.loc[:, 'date'] = pd.to_datetime(long_us_cases['date'])
long_us_deaths.loc[:, 'date'] = pd.to_datetime(long_us_deaths['date'])

long_global_cases.loc[:, 'date'] = pd.to_datetime(long_global_cases['date'])
long_global_deaths.loc[:, 'date'] = pd.to_datetime(long_global_deaths['date'])

#sort by state/country name
long_us_cases = long_us_cases.sort_values(['Province_State','date'],ascending=[True, True]).reset_index(drop=True)
long_us_deaths = long_us_deaths.sort_values(['Province_State','date'],ascending=[True, True]).reset_index(drop=True)

long_global_cases = long_global_cases.sort_values(['Country/Region','date'],ascending=[True, True]).reset_index(drop=True)
long_global_deaths = long_global_deaths.sort_values(['Country/Region','date'],ascending=[True, True]).reset_index(drop=True)
long_global_deaths.columns[0]



#Create empty dfs that we will append data to
long_us_cases_final = pd.DataFrame()
long_us_deaths_final = pd.DataFrame()
long_global_cases_final = pd.DataFrame()
long_global_deaths_final = pd.DataFrame()


#Function for calculations
def calc_daily_new(long_df, final_df):

    data_col_name = long_df.columns[2] #Use index to reference either cases or deaths column
    region_col_name = long_df.columns[0] #Use index to reference either Province_State Country/Region

    unique_state_names = long_df[region_col_name].unique() #List of unique state names

    for state in unique_state_names:
        state_df = long_df[long_df[region_col_name] == state] #Filter only data for that state
        state_df.loc[:, 'daily_new'] = (state_df[data_col_name] - state_df[data_col_name].shift(1))
        state_df.loc[:, 'seven_day_avg_new'] = state_df['daily_new'].rolling(7).mean() #7 day rolling avg of new cases/deaths
        final_df = final_df.append(state_df, ignore_index=True) #Append to the totals df
        final_df = final_df.round(2)
        #print(final_df)
    return final_df


#Run each long df through the function
long_us_cases_final = calc_daily_new(long_us_cases, long_us_cases_final)
long_us_deaths_final = calc_daily_new(long_us_deaths, long_us_deaths_final)

long_global_cases_final = calc_daily_new(long_global_cases, long_global_cases_final)
long_global_deaths_final = calc_daily_new(long_global_deaths, long_global_deaths_final)



# Drop NaNs from dfs
long_us_cases_final = long_us_cases_final.dropna()
long_us_deaths_final = long_us_deaths_final.dropna()

long_global_cases_final = long_global_cases_final.dropna()
long_global_deaths_final = long_global_deaths_final.dropna()



#Establish credentials for gspread
scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
try:
    credentials = ServiceAccountCredentials.from_json_keyfile_name(REDACTED, scope) #Credentials are stored locally in a folder called gspread_creds. In PythonAnywhere, need to use absolute pathing for this to work
except:
    print('Problem loading Google json credentials.')
    sys.exit()

spreadsheet_key = REDACTED #This is from the database Google sheet spreadsheet URL

try:
    gc = gspread.authorize(credentials) #Authorize gspread
except:
    print('Problem authorizing Google json credentials.')
    sys.exit()



##############
#Push data with some error handling for API failures

dict_of_dfs = {'state_cases_wide': us_cases, 
               'state_deaths_wide': us_deaths, 
               'state_cases_long': long_us_cases_final, 
               'state_deaths_long': long_us_deaths_final, 
               'global_cases_wide': global_cases, 
               'global_deaths_wide': global_deaths, 
               'global_cases_long': long_global_cases_final, 
               'global_deaths_long': long_global_deaths_final}


sh = gc.open_by_key(spreadsheet_key)
for x, y in dict_of_dfs.items():
    num_tries = 4 #How many times we will try to push data for each df
    for try_ in range(0, num_tries):
        try:
            if credentials.access_token_expired:
                gc.login()
                print('Logged in again via gc.login(). Pushing %s.' % x)
                sh = gc.open_by_key(spreadsheet_key)
                print('Reopened the spreadsheet by key.')
            else:
                print('No issue with access token. Pushing %s.' % x)
            d2g.upload(y, spreadsheet_key, x, credentials = credentials, row_names = True)
            print('Successfully pushed %s to Google sheet.' % x)
            time.sleep(60)
            break
        except Exception:
            print('Problem pushing %s to Google sheet. \n %s' % (x, traceback.format_exc()))
            print('Waiting 12 minutes and trying again. We can try %d more time(s)' % (num_tries - try_ - 1))
            time.sleep(720)
    else:
        print('Problem pushing data to google sheet. ' + traceback.format_exc())
        body = 'Problem pushing data to google sheet.'
        print('Problem pushing data to google sheet. Sending the alert email.')
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(sent_from, to, email_text)
        server.close()
        print('Sent the alert email about problem pushing data to google sheet.')
        sys.exit()

try:
    if credentials.access_token_expired:
       gc.login()
       print('Logged in again via gc.login(). Updating readme tab.')
       sh = gc.open_by_key(spreadsheet_key)
       print('Reopened the spreadsheet by key.')
    else:
       print('No issue with access token. Pushing readme tab.')
       readme_worksheet = sh.worksheet('ReadMe')
       readme_worksheet.update_acell('B9', datetime.datetime.now(tz).strftime("%B %d, %Y, %H:%M:%S"))
       print('Successfully pushed date and time to readme tab.')
except Exception:
     print('Problem pushing time and date to readme tab. ' + traceback.format_exc())
     body = 'Problem pushing time and date to readme tab.'
     print('Problem pushing time and date to readme tab. Sending the alert email.')
     server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
     server.ehlo()
     server.login(gmail_user, gmail_password)
     server.sendmail(sent_from, to, email_text)
     server.close()
     print('Sent the alert email about problem pushing time and date to readme tab.')
     sys.exit()

end_time = datetime.datetime.now(tz)

print('That took %.1f seconds.' % (end_time - start_time).total_seconds())

print('Finished!')
```

<br>

### Script 2: Current, same-day data from the Hopkins dashboard
This script pulls data from the [Johns Hopkins University coronavirus dashboard](https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6) by accessing the data feed in the map’s [“feature layer.”](https://www.arcgis.com/home/item.html?id=c0b356e20b30490c8b8b4c7bb9554e7c) This has proven to be the best way to get same-day case and death numbers, before they are published to the Github page overnight.  

After retrieving and parsing the data, the script groups the information three ways:
* Total worldwide confirmed cases, deaths, and recoveries
* Confirmed cases, deaths, and recoveries by country
* Confirmed cases, deaths, and recoveries by state for the United States  

It then pushes the data to a Google Sheets database. There are also checks throughout the script to flag potential data quality issues.

```python
import pandas as pd
import requests
import numpy as np
from datetime import datetime, timedelta
import io
from pandas.io.json import json_normalize
import json
import gspread
import df2gspread as d2g
from df2gspread import df2gspread as d2g
from df2gspread import gspread2df as g2d
from oauth2client.service_account import ServiceAccountCredentials
from pandas import ExcelWriter
import logging
from time import sleep
import pytz
from pytz import timezone
import sys
import smtplib
import os
import math


# Load email credentials and some additional details for error handling and alerts

print(sys.version)

gmail_user = REDACTED
gmail_password = REDACTED

sent_from = REDACTED
to = REDACTED
subject = 'Alert Alert Alert'
body = 'There was an alert activated for the Esri API script. Check PythonAnywhere logs for more details.'

email_text = """From: %s
To: %s
Subject: %s
%s
""" % (sent_from, ", ".join(to), subject, body)


# Load json response from the Esri feature layer API and convert it to a pandas dataframe. Includes some error handling that retries the API call up to 4 times if it fails. It waits 60 seconds in between attempts.


url = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query"
payload = 'f=json&where=1%3D1&outSr=4326&outFields=OBJECTID%2C%20Province_State%2C%20Country_Region%2C%20Last_Update%2C%20Lat%2C%20Long_%2C%20Confirmed%2C%20Deaths%2C%20Recovered&cacheHint=True'

headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
}


loop_var = 0
max_tries = 3

api_response = requests.request("POST", url, headers=headers, data = payload)

while api_response.status_code != 200:
    loop_var += 1
    print('Looped ' + str(loop_var) + ' times.')
    sleep(60)
    if loop_var == max_tries:
        try:
            body = 'API request failed. Did not receive response code 200.'
            print('API request failed. Sending the alert email.')
            server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            server.ehlo()
            server.login(gmail_user, gmail_password)
            server.sendmail(sent_from, to, email_text)
            server.close()
            print('Sent the alert email about request fail.')
        except:
            print('Problem sending email about the API request failure.')
        finally:
            print('Exiting the program following the API request.')
            sys.exit()

print('Response for API call: ' + str(api_response.status_code) + '. Good to go!')
api_response = api_response.json() #Turn response into a json dict for parsing in the next step
api_response


df_results = pd.DataFrame()
for i in range(len(api_response['features'])):
    df = pd.DataFrame(api_response['features'][i]['attributes'], index = [0])
    df_results = df_results.append(df, ignore_index = True)

df_results = df_results.drop(columns=['OBJECTID'])

df_results.head()


# ### Load data from existing database so that we can run checks on the new data
# We want to pull in the data from our existing Google sheet so that, as we load new data below, we can run the following two checks to see if things look wrong:
# - Are the total case, recoveries, or deaths numbers down 10% or more from the last update?
# - Are there less than 50 items listed for the U.S.?
#
# These checks take place as the new data is loaded and grouped below. If the answer to either of these is no, we abort the script and send an alert.


#Load existing totals from google sheet

#Establish credentials for gspread
scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
try:
    credentials = ServiceAccountCredentials.from_json_keyfile_name(REDACTED, scope) #Credentials are stored in a folder called gspread_creds. In PythonAnywhere, need to use absolute pathing for this to work
except:
    print('Problem loading Google json credentials.')
    sys.exit()

spreadsheet_key = REDACTED #This is from the database Google sheet spreadsheet URL


try:
    gc = gspread.authorize(credentials) #Authorize gspread
except:
    print('Problem authorizing Google json credentials.')
    sys.exit()

previous_totals = g2d.download(gfile=spreadsheet_key, wks_name = 'totals', credentials = credentials, col_names=True, row_names=True)
previous_totals


## Try to pull the previous figures from the Google Sheets' "totals" tab. If nothing is there, send the alert email.
try:
    previous_confirmed = int(previous_totals.query("category=='Confirmed'")['total'].values[0])
    previous_deaths = int(previous_totals.query("category=='Deaths'")['total'].values[0])
    previous_recovered = int(previous_totals.query("category=='Recovered'")['total'].values[0])
except:
    fail_message = 'Previous totals download failed. Either previous confirmed, deaths or recoveries were blank.'
    print(fail_message)
    body = fail_message
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(sent_from, to, email_text)
        server.close()
        print('Sent the email(s) about previous totals!')
    except:
        print('Email failed following previous totals.')
    finally:
        print('Exiting the program following the previous totals.')
        sys.exit()

# ### Get total confirmed cases, deaths, and recoveries
# Group the raw data into worldwide totals


totals = df_results[['Confirmed', 'Deaths', 'Recovered']]

totals = totals.sum().reset_index().rename(columns={'index': 'category', 0: 'total'})
totals


# #### Test #1: Check worldwide totals
# - Are the total case, recoveries, or deaths numbers down 5% or more from the last update (what is currently in the Google sheet)? If so, abort script


#Get new values
new_confirmed = totals.query("category=='Confirmed'")['total'].values[0]
new_deaths = totals.query("category=='Deaths'")['total'].values[0]
new_recovered = totals.query("category=='Recovered'")['total'].values[0]

#Convert these to floats for use in division in Python 2.x
new_confirmed = float(new_confirmed)
new_deaths = float(new_deaths)
new_recovered = float(new_recovered)

############ Round down to the nearest million and compare confirmed cases and death counts to previous
## Send notification email if totals have ticked over a million threshold
previous_confirmed_rounded = math.floor(previous_confirmed / 1000000) * 1000000
new_confirmed_rounded = math.floor(new_confirmed / 1000000) * 1000000
previous_deaths_rounded = math.floor(previous_deaths / 1000000) * 1000000
new_deaths_rounded = math.floor(new_deaths / 1000000) * 1000000

if previous_confirmed_rounded < new_confirmed_rounded or previous_deaths_rounded < new_deaths_rounded:
    threshold_message = 'A new million threshold in confirmed cases or deaths has been crossed.'
    print(threshold_message)
    body = threshold_message + ' Check pythonanywhere log for details.'
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(sent_from, to, threshold_message)
        server.close()
        print('Sent the email(s) about thresholds being crossed!')
    except:
        print('Email about thresholds failed.')
############ end million-case threshold



#Set conditions — we assume all of these will equal True with any hourly update (no less than a -7% change)
confirmed_test = (((new_confirmed - previous_confirmed)/float(previous_confirmed))*float(100.0)) > -7.0
deaths_test = (((new_deaths - previous_deaths)/float(previous_deaths))*float(100.0)) > -7.0
recovered_test = (((new_recovered - previous_recovered)/float(previous_recovered))*float(100.0)) > -7.0


print('Confirmed test: ' + str(confirmed_test))
print('Deaths test: ' + str(deaths_test))
print('Recovered test: ' + str(recovered_test))

print('Percent changes in confirmed cases, deaths, and recoveries (in that order):')
print((((new_confirmed - previous_confirmed)/float(previous_confirmed))*100.0))
print((((new_deaths - previous_deaths)/float(previous_deaths))*100.0))
print((((new_recovered - previous_recovered)/float(previous_recovered))*100.0))



rules = [confirmed_test == True,
        deaths_test == True,
        recovered_test == True,
        previous_confirmed > 0,
        previous_deaths > 0,
        previous_recovered > 0] #All of these should be True based on what we expect from the data

fail_message = ('Totals test failed. Either total confirmed cases, total deaths, or total recoveries has declined by 7% or greater since the last update.'
                '\nNew cases ' + str(new_confirmed) + ', previous cases ' +  str(previous_confirmed) +
                '\nNew deaths ' + str(new_deaths) + ', previous deaths ' +  str(previous_deaths) +
                '\nNew recoveries ' + str(new_recovered) + ', previous recoveries ' +  str(previous_recovered) +
                '\nConfirmed test: ' + str(confirmed_test) +
                '\nDeaths test: ' + str(deaths_test) +
                '\nRecovered test: ' + str(recovered_test))

success_message = ('Totals tests passed. Hooray!' +
                   '\nNew cases ' + str(new_confirmed) + ', previous cases ' +  str(previous_confirmed) +
                    '\nNew deaths ' + str(new_deaths) + ', previous deaths ' +  str(previous_deaths) +
                    '\nNew recoveries ' + str(new_recovered) + ', previous recoveries ' +  str(previous_recovered))

if all(rules):
    print(success_message) #If all rules are true, print "passed" and carry on with the script
else:
    print(fail_message)
    body = fail_message
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(sent_from, to, email_text)
        server.close()
        print('Sent the email(s) about totals test!')
    except:
        print('Email failed following totals test.')
    finally:
        print('Exiting the program following the totals test.')
        sys.exit()


# ### Group by country
# Group the raw data into country totals


country_counts = df_results.groupby('Country_Region').agg({'Confirmed':'sum','Deaths':'sum', 'Recovered':'sum'}).reset_index().sort_values('Confirmed', ascending=False)
country_counts.head(10)


# ### US only
# Group the raw data into state totals for the U.S.


us_only = df_results[df_results['Country_Region'] == 'US'].sort_values('Confirmed', ascending=False)
us_only = us_only.drop(columns=['Last_Update'])
us_only = us_only[['Country_Region','Province_State','Lat','Long_','Confirmed','Deaths','Recovered']] #Rearrange columns
print(us_only.head())


# #### Test #2: Check number of rows in U.S. data
# - Are there less than 50 items listed for the U.S.? If so, abort script


new_us_rows = us_only['Province_State'].count()

if new_us_rows > 50:
    print('U.S. rows tests passed. Hooray! \nNumber of US rows:' + str(new_us_rows)) #If all rules are true, print "passed" and carry on with the script
else:
    print('U.S. rows test failed. Sending email.')
    body = 'U.S. rows test failed. There were 50 or fewer items listed in the Province_State column of the U.S. data.'
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(sent_from, to, email_text)
        server.close()
        print('Sent the email(s) about U.S. rows test!')
    except:
        print('Email failed following U.S. rows test.')
    finally:
        print('Exiting the program following the U.S. rows test.')
        sys.exit()



#Get the date and time for use in a "readme" tab in the Google sheet
tz = timezone('US/Eastern')
now = pd.datetime.now(tz)
now_string = str(now).replace(' ','-').replace('.','-').replace(':','-')
now_pretty = now.strftime("%B %d, %Y, %H:%M:%S") #printing as "Month Date, Year" use in charts below

print(now_string)
print(now_pretty)


# ### Export the data to a Google sheet
# This uses two packages:
# - gspread to connect to a Google sheet: https://gspread.readthedocs.io/en/latest/index.html
# - df2gspread to write dataframes to the Google sheet: https://df2gspread.readthedocs.io/en/latest/index.html


sh = gc.open_by_key(spreadsheet_key) #Open the Google spreadsheet "coronavirus_database"

#The first tab in the Google sheet contains some details about the data and when it was last updated
readme_worksheet = sh.worksheet('ReadMe')
readme_worksheet.update_acell('B7', now_pretty)

#This code updates the tabs in the Google sheet

#Totals and country counts
d2g.upload(totals, spreadsheet_key, 'totals', credentials=credentials, row_names=True)
d2g.upload(country_counts, spreadsheet_key, 'latest_country_counts', credentials=credentials, row_names=True)
d2g.upload(us_only, spreadsheet_key, 'latest_state_counts', credentials=credentials, row_names=True)
```