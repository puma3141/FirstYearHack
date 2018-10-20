import json
from twython import Twython
import csv

  

with open("twitter_credentials.json", "r") as file:
    creds = json.load(file)
with open("tweeter_data.csv", mode="w") as data_file:
    data_writer = csv.writer(data_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)


 

    #authorazing
    twitter = Twython(creds['consumer_key'], creds['consumer_secret'])
    #print(twitter.get_place_trends(id = 44418))
    for hashtag in twitter.get_place_trends(id = 44418,exclude = "hashtags")[0]["trends"]:
        data_writer.writerow(['London', hashtag["name"]])