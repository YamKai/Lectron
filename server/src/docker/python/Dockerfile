FROM python:3.11-slim

# setup
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# make a user to block root access
RUN groupadd --gid 1001 safeuser \
 && useradd --uid 1001 --gid safeuser --no-create-home --shell /bin/false safeuser
RUN mkdir /safeuser && chown safeuser:safeuser /safeuser

USER safeuser
WORKDIR /safeuser

ENTRYPOINT ["python", "-u", "solution.py"]