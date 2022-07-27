const Mrhid6Utils = require("../index.js");
const iDockerHelpher = Mrhid6Utils.DockerHelper;

class DockerHelper extends iDockerHelpher {

}

const dockerHelper = new DockerHelper();


dockerHelper.ConnectDocker("localhost").then(DockerConnection => {
    console.log("Connected")
    dockerHelper.PullDockerImage(DockerConnection, "mrhid6/ssmagent").then(() => {
        console.log("Pulled Docker Image")
        return dockerHelper.CreateDockerContainer(DockerConnection, {
            Image: "mrhid6/ssmagent",
            name: "SSMAgent_Test"
        }, true)
    }).then(async container => {
        console.log("Created Docker Container")
        console.log(container.id)
        try {
            await dockerHelper.StartDockerContainer(DockerConnection, container.id);
            console.log("Container Started!")
            await dockerHelper.StopDockerContainer(DockerConnection, container.id, true);
            console.log("Container Stopped!")
        } catch (err) {
            console.log(err)
        }
    })
}).catch(err => {
    console.log(err);
})