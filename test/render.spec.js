describe("Test render functions - ", function(){

    describe("When load average is larger than 2", function() {
        beforeEach(function() {
            window.last1MinDataSet = {
                points: [
                    {
                        value: 36
                    }
                ]
            }
        });

        it("shwoAlert() should push high load message into history queue", function() {
            spyOn(window, "updateAlertQueue").and.callThrough();
            spyOn(window, "alert");

            var alertQueue = [];
            showAlert();
            expect(window.updateAlertQueue).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled()
            expect(window.alertOccured).toBeTruthy();
            expect(window.alertMessageQueue.length).toEqual(1);
        });
    });

    describe("When load average is less than 2 and alertOccured is true", function() {
        beforeEach(function() {
            window.last1MinDataSet = {
                points: [
                    {
                        value: 23
                    }
                ]
            }

            window.alertOccured = true;
        });
        it("showAlert() should pop up an alert", function() {
            spyOn(window, "updateAlertQueue").and.callThrough();
            spyOn(window, "alert");

            showAlert();
            expect(window.updateAlertQueue).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled()
            expect(window.alertOccured).toBeFalsy();
        })
    })

});