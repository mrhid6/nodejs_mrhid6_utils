class Cleanup {
    constructor() {
        this._inprogress = false;
        this._counter = 0;
        this._timeout = 10;
        this._eventHandlers = [];
        this.setupEventListeners();

        this._pendingFunctions = [];
    }

    setupEventListeners() {
        process.on("cleanup", () => {
            this.cleanup();

            setTimeout(() => {
                console.error(
                    "Could not close connections in time, forcefully shutting down"
                );
                process.exit();
            }, this._timeout * 1000);
        });

        process.on("SIGTERM", function () {
            console.log("Kill..");
            process.emit("cleanup");
        });

        // catch ctrl+c event and exit normally
        process.on("SIGINT", function () {
            console.log("Ctrl-C...");
            process.emit("cleanup");
        });

        //catch uncaught exceptions, trace, then exit normally
        process.on("uncaughtException", (e) => {
            console.log("Uncaught Exception...");
            console.log(e.stack);

            this.cleanup(e);

            setTimeout(function () {
                console.error(
                    "Could not close connections in time, forcefully shutting down"
                );
                process.exit(99);
            }, Cleanup.timeout * 1000);
        });
    }

    isCleanupInProgress() {
        return this._inprogress;
    }

    cleanup(err) {
        if (this.isCleanupInProgress()) {
            console.log("Cleanup In Progress Please Wait..");
            return;
        }

        console.log("Cleanup Started ...");
        this.startCleanup();

        this.callEventHandlers(err);
        this.startCleanupTimer();
    }

    startCleanup() {
        this._inprogress = true;
        this._counter = 0;
    }

    callEventHandlers(err) {
        if (this.isCleanupInProgress()) {
            for (var i = 0; i < this._eventHandlers.length; i++) {
                var eventHandler = this._eventHandlers[i];
                eventHandler(err);
            }
        }
    }

    startCleanupTimer() {
        this._cleanupInterval = setInterval(() => {
            if (this.isCleanupFinished()) {
                // Kill application once counter is zero.
                console.log("Cleanup Finished.");
                clearInterval(this._cleanupInterval);
                process.exit();
            } else {
                console.log(
                    "[CLEANUP] - Waiting for counter: " + this.getCounter()
                );
                const pendingFuncs = this._pendingFunctions.filter(
                    (pf) => pf.completed == false
                );

                for (let i = 0; i < pendingFuncs.length; i++) {
                    const pendingFunc = pendingFuncs[i];
                    console.log(
                        "[CLEANUP] - Waiting for pending function: " +
                            pendingFunc.funcName
                    );
                }
            }
        }, 100);
    }

    getCounter() {
        return this._counter;
    }

    increaseCounter(amount) {
        if (this.isCleanupInProgress()) {
            this._counter += amount;
        }
    }

    decreaseCounter(amount) {
        if (this.isCleanupInProgress()) {
            this._counter -= amount;
        }
    }

    isCleanupFinished() {
        return (
            this.isCleanupInProgress() &&
            this.getCounter() <= 0 &&
            this.getPendingFunctionCount() <= 0
        );
    }

    addEventHandler(callback) {
        this._eventHandlers.push(callback);
    }

    addPendingFunction(funcName) {
        this._pendingFunctions.push({
            funcName,
            completed: false,
        });
    }

    completePendingFunction(funcName) {
        const pendingFunc = this._pendingFunctions.find(
            (pf) => pf.funcName == funcName
        );

        if (pendingFunc) {
            pendingFunc.completed = true;
        }
    }

    getPendingFunctionCount() {
        return this._pendingFunctions.filter((pf) => pf.completed == false)
            .length;
    }
}

module.exports = Cleanup;
