.PHONY: all cli gui run run-cli clean help

all:
	$(MAKE) -C cpp_project all

cli:
	$(MAKE) -C cpp_project cli

gui:
	$(MAKE) -C cpp_project gui

run:
	./run_gui.sh

run-cli:
	./run_cli.sh

clean:
	$(MAKE) -C cpp_project clean
