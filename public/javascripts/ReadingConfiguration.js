function readFile(files, callback) {
    // var files = evt.target.files; // FileList object

    var result = {};
    var regions = [];
    // files is a FileList of File objects. List some properties.
    var f = files[0];
    
    
    if (f) {
        var reader = new FileReader();

        reader.onload = function(event) {
            //get all contents in the file
            var contents = event.target.result;

            var newContents = contents.replace(/\),(\s)+/g,'),').replace(/(gent\s\d+\sat\s\(\d+,\d+\))(\s)+(A)/g, (match, p1, p2, p3) => {
	            return p1 + ', ' + p3;
            });

            var lines = newContents.split('\n');

            var size = lines[0].match(/\d+/g);
            var width = size[0];
            var length = size[1];
            
            result['width'] = parseInt(width);
            result['height'] = parseInt(length);

            var i;
            var regionStrings = newContents.split("Region");
            var numberOfRegions = regionStrings.length - 1;
            
            for (i = 1; i < regionStrings.length; i++) {
                var seperateLines = regionStrings[i].split('\n');

                var region = [];

                var regionID = parseInt(seperateLines[0].match(/\d+/g)[0]);
                region['id'] = regionID;

                var p = seperateLines[1].match(/\d+/g);
                
                var j;
                for (j = 0; j < p.length; j = j + 2) {
                    var position = {};
                    position['column'] = parseInt(p[j] - 1);
                    position['row'] = parseInt(p[j + 1] - 1);
                    region.push(position);
                }

                // the agents in one region
                var agents = [];
                var a = seperateLines[2].match(/\d+/g);
                if (a) {
                    for (j = 0; j < a.length; j = j + 3) {
                        var agent = {};
                        var agentID = parseInt(a[j]);
                        agent['id'] = agentID;
                        agent['column'] = parseInt(a[j + 1] - 1);
                        agent['row'] = parseInt(a[j + 2] - 1);

                        agents.push(agent);
                    }
                }
                region['agents'] = agents;
                //add to regions, positions represent a positions in a region
                regions.push(region);
            }
            //all regions as an value in the result
            result['regions'] = regions;
            
            callback(result);
            console.log(result);
            // return result;
        };
        reader.readAsText(f);
    }
}

export {readFile};