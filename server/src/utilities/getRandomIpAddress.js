// This function returns a random IP address from one of the seven nations in the G7
// Auhtor: Refaat
export default function getRandomIpAdress() {
    const ip = ["142.166.0.1", "90.0.0.1", "80.128.0.1", "151.0.0.1", "133.0.0.1", "51.0.0.1", "8.8.8.8"];
    const rnd = Math.floor(Math.random() * (6-0)+0);
    return ip[rnd];
}
