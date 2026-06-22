---
title: "TLS Oracles (zkTLS): Liberating Private Web Data with Cryptography"
slug: "tls-oracles-zktls-liberating-private-web-data-with-cryptography"
date: "2024-04-16"
author: "Cambrena Capital"
excerpt: "TLS secures web communications but can't prove data authenticity to a third party. TLS oracles (zkTLS) bridge that gap cryptographically, liberating private web data. An intro to TLS oracles, their use cases, and a map of projects in the field."
coverImage: "./public/zktls-map.png"
tags: ["zkTLS", "TLS oracles", "cryptography", "Web3", "research"]
---

# TLS Oracles (zkTLS): Liberating Private Web Data with Cryptography

## Introduction

Communications over the Internet are secured by Transport Layer Security (TLS), a widely used security protocol. TLS enables privacy protection and data integrity between a client and a server, but it does not allow the client to prove the authenticity of the data to a third party. This problem could be addressed by having the client authenticate a particular website to pass data directly to a third party website (e.g., Bob could allow his company’s payroll record, which stores verified birth dates, to share data with a third party). However, this would force the client to share more data than necessary (providing the exact birth date instead of the fact that a certain age limit is met), and such a solution would require the addition of new web infrastructures.

Recent work introduces TLS oracles that address this challenge by cryptographically validating the data. Acting as a bridge between Web2 and Web3, TLS oracles could liberate private web data and facilitate their integration into Web3 smart contracts.

This blog post begins with a brief introduction to TLS, followed by an explanation of TLS oracles and their use cases. Subsequently, it will offer an overview of ongoing research efforts and projects in this field.

## Transport Layer Security (TLS)

### What is TLS?

As outlined by [Cloudflare](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/), Transport Layer Security is a widely adopted security protocol designed to ensure privacy and data security in Internet communications. Its predominant application involves encrypting communication between web applications and servers, such as web browsers accessing websites. At the core of TLS there is a process called [TLS handshake](https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/), in which the server and the client cryptographically secure their communication channel (i.e., when a user accesses a website using TLS, the TLS handshake begins between the user’s device and the web server).

The latest iteration, [TLS 1.3](https://www.cloudflare.com/learning/ssl/why-use-tls-1.3/), was published in 2018.

### Why is TLS important?

In the past, data was often transmitted unencrypted over the internet. Without TLS, sensitive data such as logins, credit card details and personal information are vulnerable to interception. This vulnerability extends to various online activities, including browsing habits, email exchanges, chats and conference calls. Implementing TLS in client and server applications guarantees the encryption of transmitted data with robust algorithms, protecting it from unauthorized access by third parties.

## TLS Oracles

As previously mentioned, TLS doesn’t allow a client to prove to a third party that certain data authentically came from a particular website. As a result, data use is often restricted to its point of origin.

Recent advancements have introduced TLS oracles as a solution to this problem by cryptographically confirming the origin of digital content. As also described by [Ernstberger et al](https://eprint.iacr.org/2024/447.pdf), these oracles extend a standard TLS connection with a third party (through a three-party handshake) and ensure that the third party remains unaware of the content exchanged between a client and a server. The third party acts solely as a verifier, validating the exchanged data. This allows the client to prove that certain data authentically came from a particular website. Using Zero-Knowledge Proofs (ZKPs), the client can optionally prove statements about such data without revealing the data itself (zkTLS). Using the example described in the introduction, Bob could use the company’s payroll account to prove that a certain age requirement is met without revealing the actual date of birth.

### Use cases of TLS Oracles

TLS oracles enable Web3 dApps to take advantage of data analytics and model intelligence from the traditional Internet economy and enable new use cases such as the following, as also outlined by [PADO Labs](https://docs.padolabs.org/category/use-cases) and zkPass:

- **Identity Verification**: Lightweight and reusable identity verification

- **Social Networking**: Interoperable and composable social graphs

- **Provable Assets**: Privacy-preserving attestation of crypto asset holdings

- **Crypto On & Off Ramps**: Reliable on-ramp and off-ramp with off-chain payment attestations

- **Undercollateralized DeFi Lending Protocol**: DeFi lending protocol combining on-chain and off-chain credit for lower collateralized borrowing opportunities, enhancing capital efficiency

- **Medical and Healthcare**: Facilitating secure and efficient sharing of medical records and health information between patients, healthcare providers, and other stakeholders

- **Insurance Claims**: ZKPs from private data during web sessions for insurance policy eligibility verification, enabling automatic claim settlement without manual review

## Projects working on TLS Oracles

### Initial approaches with known limitations

Initial approaches to TLS oracles have known limitations, as also mentioned by [Zhang et al](https://dl.acm.org/doi/pdf/10.1145/3372297.3417239). These methods either only work with outdated versions of TLS that do not provide privacy from the oracle (e.g., initial versions of TLSNotary), or depend on trusted hardware (e.g., [Town Crier](https://dl.acm.org/doi/pdf/10.1145/2976749.2978326); zkPortal). Other oracles rely on the cooperation of servers and require the installation of TLS extensions (e.g., [TLS-N](https://eprint.iacr.org/2017/578.pdf); [ROSEN](https://dl.acm.org/doi/pdf/10.1145/3474123.3486763)) or changes in the application layer logic (e.g. [draft-cavage-http-signatures-11](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-11); [draft-yasskin-http-origin-signed-responses-05](https://datatracker.ietf.org/doc/html/draft-yasskin-http-origin-signed-responses-05)). Server-supported oracle methods have two main problems. First, they compromise compatibility with the legacy system, which is a major hurdle to widespread adoption. Second, such solutions offer only limited exportability, as web servers retain sole discretion over what data can be exported and can censor export attempts at their own will.

### Recent projects where the verifier acts as an external entity

One of the earliest contributors to TLS Oracles is TLSNotary. The TLSNotary protocol consists of 3 steps: First, the prover (i.e. client) requests data from a server over TLS while cooperating with the verifier in secure and privacy-preserving Multi-Party Computation (MPC). Second, the prover selectively discloses the data to the verifier. Third, the verifier verifies the data. In 2022, TLSNotary was rebuilt from the ground up. This renewed version of the TLSNotary protocol offers enhanced security, privacy, and performance. It currently supports TLS 1.2. TLS 1.3 support will be added in 2024. [Shinkai Protocol](https://download.shinkai.com/Shinkai_Protocol_Whitepaper.pdf) is another protocol that takes great inspiration from the TLSNotary protocol, while adding several advancements on top specific to their AI network use case.

[DECO](https://www.deco.works/) introduced the first TLS oracle for TLS version 1.2 without server-side adaptation (back then, TLSNotary did not support TLS 1.2). In DECO, most of client’s computation is emulated using a maliciously secure Two-Party Computation (2PC) protocol. They use an implementation of the authenticated garbling, a state-of-the-art malicious 2PC framework.

[PADO Labs](https://padolabs.org/) introduced the garble-then-prove technique to achieve the same security requirement as DECO without using any heavy mechanism like generic malicious 2PC. Their end-to-end implementation shows 14× improvement in communication and an order of magnitude improvement in computation compared to DECO.

Whilst PADO Labs’ protocol can be extended to TLS 1.3, the above protocols do not provide explicit security support for TLS 1.3. Therefore, [DIDO](https://eprint.iacr.org/2023/1056.pdf) and [DiStefano](https://eprint.iacr.org/2023/1063.pdf) propose an optimized solution for TLS 1.3 websites. While DIDO uses semi-honest 2PC, DiStefano relies on maliciously secure 2PC, similar to DECO. The authors of DiStefano note that the use of semi-honest 2PC must be applied carefully to prevent loss of security.

Another project, [Crunch](https://github.com/MarcusWentz/ethdenver2024), whose whitepaper does not mention the research outlined above, is also noteworthy. Crunch is an ETHDenver hackathon winner that focuses on reducing the cost of the MPC (to allow for more participants and thus greater security) by shifting as much of the security burden as possible from the MPC component to zero-knowledge Risc0 proofs. They support TLS 1.3.

### Recent projects where the verifier acts as a proxy in between the client and the server

The proxy model, as also outlined by [Zhang et al](https://dl.acm.org/doi/pdf/10.1145/3372297.3417239), offers an alternative approach where the verifier serves as a proxy between the prover and the server (as opposed to an external entity). In this setup, the prover sends/receives messages to/from the server through the verifier. This alternative protocol presents a distinct trade-off between performance and security. It boasts high efficiency as it minimizes cryptographic operations post-handshake. However, it necessitates additional network assumptions (e.g., reliable connectivity between the proxy and the server throughout the session) and thus only withstands weaker network adversaries. For instance, the client could potentially execute a man-in-the-middle (MiTM) attack between itself and the server.

The authors of DECO note that their model is efficient for small requests, but can be expensive for large records. Therefore, they describe an extension to their protocol where the verifier acts as a proxy between the server and the client to make it more efficient.

[ORIGO](https://eprint.iacr.org/2024/447.pdf) provides a proposal similar to the proxy mode of DECO. They facilitate a TLS oracle that does not demand for any communication intensive 2PC. Therefore, they achieve constant communication, independent of the size of the data requested from an application server. They leverage that in TLS 1.3.

[Janus](https://eprint.iacr.org/2023/1377.pdf) is also a TLS oracle designed specifically for TLS 1.3 within the proxy framework. Janus utilizes handshake and record layer 2PC, ensuring security against MiTM attacks in the proxy mode (as opposed to ORIGO which works under the assumption of a weaker network adversary and thus offers no MiTM security). Yet, the utilization of 2PC requires communication in size linear to the number of gates in the garbled circuit and is therefore not as scalable.

[Reclaim Protocol](https://www.reclaimprotocol.org/) introduces an HTTP proxy to oversee the handshake and data transmission process. Every webpage accessed is routed through a randomly selected HTTP proxy witness. Notably, the HTTP proxy witness is not a MiTM attack. Users do need to use their mobile phone to generate the proof but they don’t need to install any app. Reclaim client software uses Appclips on iOS and InstantApps on Android.

[zkPass](https://zkpass.org/) has recently adapted its original version of the protocol and now also positions the verifier between the prover and the server. Although it is not yet updated in the whitepaper, there is a proxy in real production on their [front-end portal](https://portal.zkpass.org/attestation/market).

![](./public/zktls-map.png)

Projects working on TLS Oracles (not comprehensive; as of April 16, 2024)

The illustration above provides a non-exhaustive overview of projects exploring TLS oracles and complementary services. As the space is still young and rapidly evolving, it’s likely that this illustration could change considerably in just a few months.

## Limitations of TLS Oracles

As with most emerging technologies, TLS oracles have limitations in terms of scalability. As a result, TLS oracles are very effective at selectively verifying small amounts of private data, but are limited in their applicability to larger sensitive data sets. The proxy model is an alternative approach that allows for better scalability, but relies on more network assumptions to withstand a MiTM attack.

## Complementary Services to TLS Oracles

To realize the vision of integrating Internet data into Web3 smart contracts and enhance their capabilities, TLS oracle providers are collaborating with other service providers as described below.

### Attestation registries

Attestations are shared with attestation registries like Verax, [EAS](https://attest.sh/), [BAS](https://doc.bascan.io/) or [Sign Protocol](https://sign.global/). These registries serve as infrastructures, enabling the creation of diverse attestation schemas and assisting users in generating and distributing attestations (both on-chain or off-chain) to other on-chain entities.

Taking the example of Sign protocol, it facilitates partners like PADO Labs or zkPass to:

- Seamlessly integrate validation results onto any chain and bridge these results to other chains subsequent to the initial attestation

- Encrypt and permanently store the captured TLS session and zero-knowledge proof for archival purposes and future retrieval

- Enable any smart contract to access, correctly decode, and utilize validation results

### ZK Coprocessors

TLS Oracles focus on harnessing the value of off-chain user data. In numerous scenarios, users’ off-chain data can be combined with on-chain data to meet business requirements, a common practice in on-chain scenarios. For instance, to engage with a permissioned DeFi protocol, Bob may need to establish a comprehensive profile comprising both off-chain identity records (e.g., the fulfillment of a certain age requirement) and on-chain data (e.g., historic trading volume).

Furthermore, potential collaborations with other off-chain verification services, such as [Provably](https://www.provably.ai/), which offers zero-knowledge based verifiable analytics on private big data, would also be possible. Let’s take an example of a DeFi lending protocol where Bob needs to show that his average savings over the last months have been enough to access a P2P loan. Bob can attest the source of his financial data with a TLS oracle, and that the computed statistic (analytics), the average of his savings, has been computed correctly with an off-chain verification service like Provably.

## Closing Words

While TLS ensures secure access to web data, its limitation in validating data authenticity to a third party restricts the utilization of that data. TLS oracles, however, bridge this gap by cryptographically affirming the origin of digital content, liberating private data from the confines of centralized servers and expanding its integration into Web3 smart contracts.

Projects like TLSNotary, DECO, and others have pioneered innovative approaches to TLS oracles, employing techniques such as three-party handshake, secure multi-party computation (MPC) and zero-knowledge proofs (ZKPs) to enhance security and privacy. These advancements open doors to diverse applications across various sectors, including identity verification, social networking, DeFi lending, or insurance claims settlement.

Despite the progress made, TLS oracles still encounter limitations in validating larger data sets. However, ongoing research and development efforts continue to address these challenges and expand the possibilities of TLS oracles in the Web3 ecosystem.

*Acknowledgements: This article expands upon the content presented in prior writings, such as [Cloudflare](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/), [Ernstberger et al](https://eprint.iacr.org/2024/447.pdf), and [Zhang et al](https://dl.acm.org/doi/pdf/10.1145/3372297.3417239).*

*Many thanks to [Emanuele Ragnoli](https://www.linkedin.com/in/emanuele-ragnoli-a33b57/) for conversations around this topic.*

*If you have a project working on TLS oracles, or if you are using TLS oracles, please reach out!*
