FROM rust:1.75 AS builder

WORKDIR /usr/src/kos-backend

COPY Cargo.toml .
COPY Cargo.lock .

RUN mkdir -p src && echo 'fn main() { println!("dummy"); }' > src/main.rs
RUN cargo build --release

COPY . .
RUN rm -f src/main.rs
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /usr/src/kos-backend/target/release/kos-backend ./kos-backend

ENV KOS_PORT=3001
ENV KOS_BIND_ADDR=0.0.0.0
ENV KOS_DATA_DIR=/data

EXPOSE 3001

CMD ["./kos-backend"]
