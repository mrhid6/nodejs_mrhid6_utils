const {
    Docker
} = require('node-docker-api');


class DockerHelper {



    ConnectDocker = async(url) => {
        let dockerSettings = {
            host: "http://" + url,
            port: 2375
        }

        return new Docker(dockerSettings);
    };


    PullDockerImage = async(DockerConnection, image, tag = "latest", authSettings = {}) => {

        const promisifyStream = (stream) => new Promise((resolve, reject) => {
            stream.on('data', (d) => {})
            stream.on('end', resolve)
            stream.on('error', reject)
        });

        try {
            const stream = await DockerConnection.image.create(authSettings, {
                fromImage: image,
                tag
            });

            await promisifyStream(stream);

        } catch (err) {
            throw err;
        }
    };

    CreateDockerContainer = async(DockerConnection, ContainerSettings, Force = false) => {
        try {
            const containerExists = await this.CheckDockerContainerExistsWithName(DockerConnection, ContainerSettings.name)

            if (containerExists && Force == false) {
                throw new Error("Container Already Exists With That Name!")
            }

            if (containerExists) {
                await this.DeleteDockerContainersWithName(DockerConnection, ContainerSettings.name);
            }

            const newContainer = await DockerConnection.container.create(ContainerSettings)
            return newContainer;
        } catch (err) {
            throw err;
        }
    };

    GetDockerContainersWithName = async(DockerConnection, ContainerName) => {
        const resArray = [];

        try {
            const containers = await DockerConnection.container.list({
                all: 1
            });

            for (let i = 0; i < containers.length; i++) {
                const container = containers[i];
                let name = container.data.Names[0];
                name = name.replace("/", "")
                if (name == ContainerName) {
                    resArray.push(container)
                }
            }
        } catch (err) {
            throw err;
        }
        return resArray;
    };

    CheckDockerContainerExists = async(DockerConnection, ContainerID) => {
        const container = await this.GetDockerContainerByID(DockerConnection, ContainerID)
        return container != null;
    };

    CheckDockerContainerExistsWithName = async(DockerConnection, ContainerName) => {
        const containers = await this.GetDockerContainersWithName(DockerConnection, ContainerName)
        return containers.length > 0;
    };

    DeleteDockerContainer = async(Container) => {
        if (Container == null)
            throw new Error("Container Doesn't Exist!")

        try {
            await Container.delete({
                force: true
            });
        } catch (err) {
            throw err;
        }
    };

    DeleteDockerContainerById = async(DockerConnection, ContainerID) => {
        try {
            const container = await this.GetDockerContainerByID(DockerConnection, ContainerID)
            await this.DeleteDockerContainer(container);
        } catch (err) {
            throw err;
        }
    };

    DeleteDockerContainersWithName = async(DockerConnection, ContainerName) => {
        const containers = await this.GetDockerContainersWithName(DockerConnection, ContainerName)

        try {
            for (let i = 0; i < containers.length; i++) {
                const container = containers[i];
                await container.delete({
                    force: true
                });
            }
        } catch (err) {
            throw err;
        }
    };

    GetDockerContainerByID = async(DockerConnection, ContainerID) => {
        try {
            const tempContainer = DockerConnection.container.get(ContainerID);

            const container = await tempContainer.status();
            return container;
        } catch (err) {
            return null;
        }
    };

    StartDockerContainer = async(DockerConnection, ContainerID) => {
        const container = await this.GetDockerContainerByID(DockerConnection, ContainerID);

        if (container == null)
            throw new Error("Container Doesn't Exist!")

        if (container.data != null && container.data.State.Status == "running") {
            return;
        }
        try {
            await container.start();
            await this.WaitForContainerToStart(DockerConnection, ContainerID);
        } catch (err) {
            throw err;
        }
    };


    WaitForContainerToStart(DockerConnection, ContainerID) {
        return new Promise((resolve, reject) => {

            const attemptsLimit = 10;
            let attempts = 0;

            let interval = setInterval(() => {
                this.GetDockerContainerByID(DockerConnection, ContainerID).then(container => {

                    if (attempts >= attemptsLimit) {
                        reject(new Error("Docker Failed To Start"));
                        clearInterval(interval);
                        return;
                    }

                    if (container.data != null && container.data.State.Status == "running") {
                        resolve()
                        clearInterval(interval);
                    }

                    attempts++;
                })
            }, 5000);
        })
    };

    StopDockerContainer = async(DockerConnection, ContainerID, Force = false) => {
        const container = await this.GetDockerContainerByID(DockerConnection, ContainerID);

        if (container == null)
            throw new Error("Container Doesn't Exist!")

        if (container.data != null && container.data.State.Status != "running") {
            return;
        }
        try {
            await container.stop({
                force: Force
            });
            await this.WaitForContainerToStop(DockerConnection, ContainerID);
        } catch (err) {
            throw err;
        }
    };

    WaitForContainerToStop(DockerConnection, ContainerID) {
        return new Promise((resolve, reject) => {

            const attemptsLimit = 10;
            let attempts = 0;

            let interval = setInterval(() => {
                this.GetDockerContainerByID(DockerConnection, ContainerID).then(container => {

                    if (attempts >= attemptsLimit) {
                        reject(new Error("Docker Failed To Stop"));
                        clearInterval(interval);
                        return;
                    }

                    if (container.data != null && container.data.State.Status != "running") {
                        resolve()
                        clearInterval(interval);
                    }

                    attempts++;
                })
            }, 5000);
        })
    };
}

module.exports = DockerHelper;