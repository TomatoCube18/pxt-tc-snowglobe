# MakeCode Package for TomatoCube X'MAS SnowGlobe TableTop Toy.

This library provides a Microsoft Makecode helper package for the X'MAS SnowGlobe TableTop Toy with I2C OLED & RTC.
Make sure the additional PXT/Extension is included for the SnowGlobe to function properly with the micro:bit v2. 

Fulfilling Needed PXt/Extensions. 
Go to **Extensions** and add:
- **NeoPixel** (search `neopixel`, official one)
- **OLED12864_I2C** extension by `makecode-extensions/OLED12864_I2C`
  - In Extensions search box, paste:
    `https://github.com/makecode-extensions/OLED12864_I2C` [GitHub](https://github.com/makecode-extensions/OLED12864_I2C)

The address of the onboard I2C devices are as follow.
* OLED - 0x3C
* DS3231(RTC) - 0x68

## License

MIT

## Supported targets

* for PXT/microbit