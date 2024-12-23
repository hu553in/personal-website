.PHONY: all
all: clean run

.PHONY: clean
clean:
	rm -rf ./public

.PHONY: run
run:
	hugo server
