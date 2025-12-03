/**
  * TC-MAKECODE-SNOWGLOBE Block
  */

  const enum TC_DayOfWeek {
      //% block="Monday"
      MONDAY = 1,
      //% block="Tuesday"
      TUESDAY = 2,
      //% block="Wednesday"
      WEDNESDAY = 3,
      //% block="Thursday"
      THURSDAY = 4,
      //% block="Friday"
      FRIDAY = 5,
      //% block="Saturday"
      SATURDAY = 6,
      //% block="Sunday"
      SUNDAY = 7,
  }


  //% color=#0fbc11 icon="\uF069" block="TomatoCube"
namespace tomatoCube {
    let DS3231_ADDR = 0x68
    //let OLED_ADDR = 0x3C
    let _I2CAddr = 0x3C;
    
    // Send a single OLED SSD1306 command
    function oledCmd (cmd: number) {
        let buf = pins.createBuffer(2)
        // 0x00 = command mode
        // 0x00 = command mode
        buf[0] = 0
        buf[1] = cmd
        pins.i2cWriteBuffer(_I2CAddr, buf)
    }

    // BCD -> decimal for DS3231
    function bcdToDec(bcd: number): number {
        return (bcd >> 4) * 10 + (bcd & 0x0F)
    }

    // Convert decimal to BCD: e.g. 25 -> 0x25
    function decToBcd(val: number): number {
        const tens = Math.idiv(val, 10)
        const ones = val % 10
        return (tens << 4) | ones
    }

    /**
     * Flip OLED Display
     * @param addr is i2c addr, eg: 60
     */
    //% subcategory=SnowGlobe(I2C)
    //% blockId="flip_oled" block="Rotate OLED with addr %addr"
    //% addr.defl = 0x3C
    //% weight=105 
    export function flip_oled(addr: number = 60):void {
        _I2CAddr = addr
        // Flip OLED
        oledCmd(160)
        oledCmd(192)
        basic.pause(50)
                    
    }
    

    /**
     * Read time from RTC IC.
     */
    //% subcategory=SnowGlobe(I2C)
    //% blockId="read_rtc_time" block="Get the current time from DS3231 as HH:MM:SS"
    //% weight=104 
    export function readTime(): string {
        
        // point to register 0x00
        let buf = pins.createBuffer(1)
        buf.setNumber(NumberFormat.UInt8BE, 0, 0x00)
        pins.i2cWriteBuffer(DS3231_ADDR, buf)

        let data = pins.i2cReadBuffer(DS3231_ADDR, 7)
        let sec = bcdToDec(data.getNumber(NumberFormat.UInt8BE, 0))
        let min = bcdToDec(data.getNumber(NumberFormat.UInt8BE, 1))
        let hour = bcdToDec(data.getNumber(NumberFormat.UInt8BE, 2) & 0x3F)

        let hh = ("0" + hour).slice(-2)
        let mm = ("0" + min).slice(-2)
        let ss = ("0" + sec).slice(-2)
        return `${hh}:${mm}:${ss}`
        
    }

    /**
     * Read Date from RTC IC.
     */
    //% subcategory=SnowGlobe(I2C)
    //% blockId="read_rtc_date" block="Get the current date from DS3231 as YYYY-MM-DD"
    //% weight=103
    export function readDate(): string {
      // Point to register 0x00
      let buf = pins.createBuffer(1)
      buf.setNumber(NumberFormat.UInt8BE, 0, 0x00)
      pins.i2cWriteBuffer(DS3231_ADDR, buf)
  
      // Read 7 bytes: sec, min, hr, DOW, day, month, year
      let data = pins.i2cReadBuffer(DS3231_ADDR, 7)
  
      let day = bcdToDec(data.getNumber(NumberFormat.UInt8BE, 4))
      let month = bcdToDec(data.getNumber(NumberFormat.UInt8BE, 5) & 0x1F) // mask century bit
      let year = bcdToDec(data.getNumber(NumberFormat.UInt8BE, 6))
  
      // Format as YYYY-MM-DD (assuming 20xx)
      let yyyy = 2000 + year
      let mm = ("0" + month).slice(-2)
      let dd = ("0" + day).slice(-2)
  
      return `${yyyy}-${mm}-${dd}`
    }

    /**
     * Read day from RTC IC.
     */
    //% subcategory=SnowGlobe(I2C)
    //% blockId="read_rtc_dow" block="Get the current DOW from DS3231 as 1–7"
    //% weight=102 
    export function readDay(): number {
       // Point to 0x03 (day-of-week register)
       let buf = pins.createBuffer(1)
       buf.setNumber(NumberFormat.UInt8BE, 0, 0x03)
       pins.i2cWriteBuffer(DS3231_ADDR, buf)
   
       let d = pins.i2cReadNumber(DS3231_ADDR, NumberFormat.UInt8BE, false)
       return bcdToDec(d)
    }

    /**
     * Read time from RTC IC.
     */
    //% subcategory=SnowGlobe(I2C)
    //% blockId="read_rtc_day" block="Get the current day from DS3231 as Sun, Mon, Tue.."
    //% weight=101 
    export function readDayName(): string {
       let dow = readDay()
   
       let names = ["?", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
   
       if (dow < 1 || dow > 7) return "?"
       return names[dow]
    }


    /**
     * Set current time to RTC IC.
     */
    //% subcategory=SnowGlobe(I2C)
    //% blockId="set_rtc_time" block="Set the current time of %hour|: %minute|: %second| Date of %day|/ %month|/ 20 %year|Day of %dow|to DS3231"
    //% hour.min=0
    //% hour.max=23
    //% minute.min=0
    //% minute.max=59
    //% second.min=0
    //% second.max=59
    //% day.min=1
    //% day.max=31
    //% day.defl=1
    //% month.min=1
    //% month.max=12
    //% month.defl=1
    //% year.min=25
    //% year.max=50
    //% year.defl=25
    //% weight=100 
    export function setTime(hour: number, minute: number, second: number,
                               day: number, month: number, year: number, dow: TC_DayOfWeek): void {
        
        // Build buffer: [0x00, sec, min, hour, dow, day, month, year]

        let buf = pins.createBuffer(8)
        buf.setNumber(NumberFormat.UInt8BE, 0, 0x00)                  // start register
        buf.setNumber(NumberFormat.UInt8BE, 1, decToBcd(second))      // seconds
        buf.setNumber(NumberFormat.UInt8BE, 2, decToBcd(minute))      // minutes
        buf.setNumber(NumberFormat.UInt8BE, 3, decToBcd(hour))        // hours (24h)
        buf.setNumber(NumberFormat.UInt8BE, 4, decToBcd(dow))         // day-of-week
        buf.setNumber(NumberFormat.UInt8BE, 5, decToBcd(day))         // day
        buf.setNumber(NumberFormat.UInt8BE, 6, decToBcd(month))       // month
        buf.setNumber(NumberFormat.UInt8BE, 7, decToBcd(year))        // year (00–99)

        // Write all in one go
        pins.i2cWriteBuffer(DS3231_ADDR, buf)

        
    }
}
