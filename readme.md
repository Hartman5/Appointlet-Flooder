# Appointlet Flooder

This program scrapes all avaliable meeting times and stores them in an array. The program then interates through the array of avaliable meeting times, scheduling a meeting at each time. 

# Limitations

Appointlet's API security is limited, but they have implemented ratelimits. IP ratelimits are bypassed by a rotating proxy network, but they also hard limit each account. Meaning each account can only have five meetings scheduled every ~30 seconds.

# Tools Used

- HTTP Toolkit
- Curl Converter

# Notes

Appointlet's API is vulnerable, with nearly zero security. They've got no hashing, encoding, fingerprinting, tokenization, etc. they don't even have cookies or captchas. Appointlet could 10x their API by implementing any captcha solution. (recap, hcap, funcap, etc.) They could even implement inviscaptcha to provide background security and not effect the user experience.

# Contact

Telegram - @Hartman50
