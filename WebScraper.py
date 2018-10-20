import json
from twython import Twython
import csv



def updater():
    with open("city_data.csv", "r") as f:
        city_data = [tuple(line) for line in csv.reader(f)]

        with open("twitter_credentials.json", "r") as file:
            creds = json.load(file)
        with open("tweeter_data.json", mode="w") as data_file:
            #authorazing
            twitter = Twython(creds['consumer_key1'], creds['consumer_secret1'])
            listOfHashtags = []
            #for data in city_data:
            for data in city_data[:40]:
                name = ''+data[0]
                lat = ''+data[1]
                lon = ''+data[2]
                city_id = twitter.get_closest_trends(lat=lat, long=lon)[0]["woeid"]
                for hashtag in twitter.get_place_trends(id = int(city_id),exclude = "hashtags")[0]["trends"]:
                    #print(hashtag)
                    dictEnt = {"lat": lat, "lon": lon, "hashtag": hashtag["name"], "url": hashtag["url"], "name":name}
                    #print(dictEnt)
                    listOfHashtags.append(dictEnt)
            twitter2 = Twython(creds['consumer_key2'], creds['consumer_secret2'])
            for data in city_data[40:80]:
                name = ''+data[0]
                lat = ''+data[1]
                lon = ''+data[2]
                city_id = twitter2.get_closest_trends(lat=lat, long=lon)[0]["woeid"]
                for hashtag in twitter2.get_place_trends(id = int(city_id),exclude = "hashtags")[0]["trends"]:
                    dictEnt = {"lat": lat, "lon": lon, "hashtag": hashtag["name"], "url": hashtag["url"], "name": name}
                    #print(dictEnt)
                    listOfHashtags.append(dictEnt)
            json.dump(listOfHashtags , data_file)
