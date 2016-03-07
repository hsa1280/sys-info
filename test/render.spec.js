describe("Test render functions - ", function(){

    beforeEach(function() {
        window.last1MinDataSet = {
            bars: [
                {
                    value: 36
                }
            ]
        }
    });

    it("shwoAlert() should push high load message into history queue", function() {
        spyOn(window, "updateAlertQueue").and.callThrough();

        var alertQueue = [];
        showAlert();
        expect(window.updateAlertQueue).toHaveBeenCalled();
        expect(window.alertOccured).toBeTruthy();
        expect(window.alertMessageQueue.length).toEqual(1);
    });

});