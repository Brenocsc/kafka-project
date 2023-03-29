'use strict';

const Benchmark = require('benchmark');
const when = require('when');

const url = require('os').hostname() + ':9093';

const N = parseInt(process.argv[2], 10) || 1000;
const TOPIC = 'benchmark';

console.log('N:', N, 'topic:', TOPIC);

// RDKAFKA
const RdKafka = require('node-rdkafka');
const rdProducerConf = {
    'metadata.broker.list': url,
    'queue.buffering.max.ms': 10,
    'queue.buffering.max.messages': 100000,
    'queue.buffering.max.kbytes': 1048576
};
const producerRD = new RdKafka.Producer(rdProducerConf);

producerRD.setPollInterval(2000);

// let rdProduceCounter = 0;
// producerRD.on('delivery-report', (e, report) => {
//     if (!e) {
//         rdProduceCounter++;
//     }
// });

// Workaround when produce() throws error
const rdProduceDelay = 100;
let rdProduceAttempt = 0;
const rdProduce = (topic, message) => {
    try {
        producerRD.produce(topic, -1, message, null);
        rdProduceAttempt = 0;
    } catch (e) {
        if (e.message.match(/Queue full/)) {
            rdProduceAttempt++;

            if (rdProduceAttempt == 1) {
                producerRD.poll();
            }

            return when()
            .delay(rdProduceDelay)
            .then(() => {
                return rdProduce(topic, message);
            });
        } else {
            throw e;
        }
    }
};
const produceMessagesRD = (messages) => {
    return when.all(
        messages.map((message) => {
            return rdProduce(TOPIC, message);
        })
    )
};

// KAFKAJS
const KafkaJS = require('kafkajs').Kafka;
const kafkaJS = new KafkaJS({
    clientId: 'kafkajs',
    brokers: [url]
});
const producerJS = kafkaJS.producer();
const produceMessagesJS = (messages) => {
    return producerJS.send({
        topic: TOPIC,
        acks: 0,
        messages: messages.map((message) => {
            return {
                value: message
            };
        })
    })
};

// Messages generator
const genMessage = () => ({
    number: Math.random(), date: new Date()
});

const genStrings = (N) => {
    const messages = [];
    N = N || 100;
    for (let i = 0; i < N; i++) {
        messages.push(JSON.stringify(genMessage()));
    }
    return messages;
};

const genBuffers = (N) => {
    const messages = [];
    N = N || 100;
    for (let i = 0; i < N; i++) {
        messages.push(Buffer.from(JSON.stringify(genMessage())));
    }
    return messages;
};

// Benchmark
Benchmark.options.minSamples = 100;
Benchmark.options.initCount = 2;

const suite = new Benchmark.Suite();

suite
.add(`generate ${N} buffers`, {
    defer: false,
    fn: () => {
        genBuffers(N);
    }
})
.add(`generate ${N} strings`, {
    defer: false,
    fn: () => {
        genStrings(N);
    }
})
.add(`node-rdkafka.produce ${N} messages (type Buffer) one by one`, {
    defer: true,
    fn: (d) => {
        produceMessagesRD(genBuffers(N))
        .then(() => {
            d.resolve();
        })
        .catch(d.resolve);
    }
})
.add(`kafkajs.send ${N} messages (type string) at once`, {
    defer: true,
    fn: (d) => {
        produceMessagesJS(genStrings(N))
        .then(() => {
            d.resolve();
        })
        .catch(d.resolve);
    }
})
// add listeners
.on('cycle', function (event) {
    console.log(String(event.target));
})
.on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    process.exit(0);
});

when.join(
    producerJS.connect(),
    producerRD.connect()
)
.then(() => {
    // console.log('clients started, benchmark begins');
    suite.run({
        async: false
    });
})
.catch((e) => {
    console.error(e);
    process.exit(1);
});
