var instrument = require('../lib/instrumentation');

describe("Parsing", function () {
    var prof;

    beforeEach(function () {
        prof = new instrument.Instrumentation();   
    });

    it("should parse fragments", function () {
        var data = "<div>No content</div>";
        var inst = prof.processHTML(data);
        expect(inst).toEqual(data);
    });

    it("should parse empty html", function () {
        var data = "<html></html>";
        var inst = prof.processHTML(data);
        expect(inst).toEqual(data);
    });

    it("should parse full html", function () {
        var data = "<html><head><title>Full</title></head><body>Body</body></html>";
        var inst = prof.processHTML(data);
        expect(inst).toEqual(data);
    });

    it("should parse headless html", function () {
        var data = "<html><body><div>No content</div></body></html>";
        var inst = prof.processHTML(data);
        expect(inst).toEqual(data);
    });

    xit("should parse bodyless html", function () {
        var data = "<html><head><title>No body</title></head></html>";
        var inst = prof.processHTML(data);
        expect(inst).toEqual(data);
    });
});
