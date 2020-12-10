var logger = {

    OFF: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,

    set level(logLevel) {
        if (logLevel === void 0)
            logLevel = logger.OFF

        if (logLevel >= this.ERROR)
            this.error = console.error.bind(window.console)
        else
            this.error = () => { }

        if (logLevel >= this.WARN)
            this.warn = console.warn.bind(window.console)
        else
            this.warn = () => { }

        if (logLevel >= this.INFO)
            this.info = console.info.bind(window.console)
        else
            this.info = () => { }

        if (logLevel >= this.DEBUG)
            this.log = console.log.bind(window.console)
        else
            this.log = () => { }

        this.logLevel = logLevel
    },
    get level() { return this.logLevel }
}
logger.level = logger.DEBUG
